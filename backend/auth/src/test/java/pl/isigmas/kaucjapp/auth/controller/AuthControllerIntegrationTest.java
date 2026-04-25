package pl.isigmas.kaucjapp.auth.controller;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.ServletException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import pl.isigmas.kaucjapp.auth.TestcontainersConfiguration;
import pl.isigmas.kaucjapp.auth.client.UserClient;
import pl.isigmas.kaucjapp.auth.dto.request.LoginCredentials;
import pl.isigmas.kaucjapp.auth.dto.request.User;
import pl.isigmas.kaucjapp.auth.entity.Account;
import pl.isigmas.kaucjapp.auth.entity.RefreshToken;
import pl.isigmas.kaucjapp.auth.repository.AccountRepository;
import pl.isigmas.kaucjapp.auth.repository.RefreshTokenRepository;
import pl.isigmas.kaucjapp.auth.security.Encoder;

import java.util.Date;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Import({TestcontainersConfiguration.class})
@DisplayName("AuthController Integration Tests")
class AuthControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private Encoder encoder;

    @MockitoBean
    private UserClient userClient;

    @MockitoBean
    private pl.isigmas.kaucjapp.auth.client.NotificationClient notificationClient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        refreshTokenRepository.deleteAll();
        accountRepository.deleteAll();
        
        // Reset mock to default behavior
        Mockito.reset(userClient);
        when(userClient.create(any(), anyString())).thenReturn(ResponseEntity.status(201).build());

        Mockito.reset(notificationClient);
        when(notificationClient.sendWelcomeEmail(any())).thenReturn(ResponseEntity.ok().build());
    }

    @Nested
    @DisplayName("GET /api/auth/status")
    class StatusEndpointTests {

        @Test
        @DisplayName("Should return Ready status")
        void shouldReturnReadyStatus() throws Exception {
            mockMvc.perform(get("/api/auth/status"))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Ready"));
        }
    }

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterEndpointTests {

        private User createValidUser() {
            User user = new User();
            user.setUsername("newuser");
            user.setEmail("newuser@example.com");
            user.setPassword("Password123!");
            user.setPhone("123456789");
            user.setFirstName("John");
            user.setLastName("Doe");
            return user;
        }

        @Test
        @DisplayName("Should register user successfully")
        void shouldRegisterUserSuccessfully() throws Exception {
            // given
            User user = createValidUser();

            // when and then
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andExpect(status().isCreated());

            // Verify account was created in database
            assertTrue(accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("newuser", "newuser").isPresent());
        }

        @Test
        @DisplayName("Should hash password before storing")
        void shouldHashPasswordBeforeStoring() throws Exception {
            // given
            User user = createValidUser();
            user.setPassword("myPlainPassword123!");

            // when
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andExpect(status().isCreated());

            // then
            Account savedAccount = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("newuser", "newuser").orElseThrow();
            assertNotEquals("myPlainPassword", savedAccount.getPasswordHash());
            assertTrue(savedAccount.getPasswordHash().startsWith("$2a$"));
        }

        @Test
        @DisplayName("Should reject registration with missing username")
        void shouldRejectMissingUsername() throws Exception {
            // given
            User user = createValidUser();
            user.setUsername(null);

            // when and then
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject registration with blank username")
        void shouldRejectBlankUsername() throws Exception {
            // given
            User user = createValidUser();
            user.setUsername("   ");

            // when and then
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject registration with missing email")
        void shouldRejectMissingEmail() throws Exception {
            // given
            User user = createValidUser();
            user.setEmail(null);

            // when and then
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject registration with invalid email format")
        void shouldRejectInvalidEmailFormat() throws Exception {
            // given
            User user = createValidUser();
            user.setEmail("not-an-email");

            // when and then
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject registration with missing password")
        void shouldRejectMissingPassword() throws Exception {
            // given
            User user = createValidUser();
            user.setPassword(null);

            // when and then
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject registration with invalid phone number")
        void shouldRejectInvalidPhoneNumber() throws Exception {
            // given
            User user = createValidUser();
            user.setPhone("12345");

            // when and then
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andExpect(status().isBadRequest());
        }

        @ParameterizedTest(name = "Should reject invalid password: {0}")
        @ValueSource(strings = {
                "password123!", // no big letter
                "PASSWORD123!", // no small letter
                "Password!!!",  // no digit
                "Password1234", // no special sign
                "Pa1!"          // to short(min=6)
        })
        void shouldRejectInvalidPassword(String invalidPassword) throws Exception{
            // given
            User user = createValidUser();

            user.setPassword("invalidPassword");

            // when and then
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andExpect(status().isBadRequest());

        }

        @Test
        @DisplayName("Should reject phone with letters")
        void shouldRejectPhoneWithLetters() throws Exception {
            // given
            User user = createValidUser();
            user.setPhone("123abc456");

            // when and then
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Empty JSON body")
        void shouldRejectEmptyBody() throws Exception {
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Invalid JSON")
        void shouldRejectInvalidJson() throws Exception {
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("not valid json"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("UserClient failure should rollback account creation")
        void shouldRollbackWhenUserClientFails() {
            // given
            User user = createValidUser();
            when(userClient.create(any(), anyString())).thenThrow(new RuntimeException("User service unavailable"));

            // when and then
            assertDoesNotThrow(() ->
                    mockMvc.perform(post("/api/auth/register")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(user)))
                            .andExpect(status().isInternalServerError()));

            assertFalse(accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("newuser", "newuser").isPresent(),
                    "BUG: Account should not be created when UserClient fails");
        }
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    @Transactional
    class LoginEndpointTests {

        private Account createTestAccount() {
            Account account = new Account();
            account.setUsername("existinguser");
            account.setEmail("existing@example.com");
            account.setPasswordHash(encoder.hashPassword("correctPassword123!"));
            account.setStatus(AccountStatus.ACTIVE);
            return accountRepository.save(account);
        }

        @Test
        @DisplayName("Should login successfully with username")
        void shouldLoginSuccessfullyWithUsername() throws Exception {
            // given
            Account account = createTestAccount();
            account.setStatus(AccountStatus.ACTIVE);
            accountRepository.save(account);
            
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier("existinguser");
            credentials.setPassword("correctPassword123!");

            // when and then
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(credentials)))
                    .andExpect(status().isOk())
                    .andExpect(content().string(matchesPattern("[a-f0-9-]{36}")));
        }

        @Test
        @DisplayName("Should login successfully with email")
        void shouldLoginSuccessfullyWithEmail() throws Exception {
            // given
            Account account = createTestAccount();
            account.setStatus(AccountStatus.ACTIVE);
            accountRepository.save(account);
            
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier("existing@example.com");
            credentials.setPassword("correctPassword123!");

            // when and then
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(credentials)))
                    .andExpect(status().isOk())
                    .andExpect(content().string(matchesPattern("[a-f0-9-]{36}")));
        }

        @Test
        @DisplayName("Should create refresh token in database")
        void shouldCreateRefreshTokenInDatabase() throws Exception {
            // given
            Account account = createTestAccount();
            account.setStatus(AccountStatus.ACTIVE);
            accountRepository.save(account);
            
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier("existinguser");
            credentials.setPassword("correctPassword123!");
            credentials.setDeviceInfo("Test Device");

            // when
            MvcResult result = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(credentials)))
                    .andExpect(status().isOk())
                    .andReturn();

            String token = result.getResponse().getContentAsString();

            // then
            RefreshToken savedToken = refreshTokenRepository.findByToken(token).orElseThrow();
            assertEquals(account.getId(), savedToken.getAccount().getId());
            assertEquals("Test Device", savedToken.getDeviceInfo());
            assertFalse(savedToken.isRevoked());
        }

        @Test
        @DisplayName("Should reject wrong password")
        void shouldRejectWrongPassword() throws Exception {
            // given
            Account account = createTestAccount();
            account.setStatus(AccountStatus.ACTIVE);
            accountRepository.save(account);
            
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier("existinguser");
            credentials.setPassword("wrongPassword");

            // when and then
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(credentials)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should reject non-existent user")
        void shouldRejectNonExistentUser() throws Exception {
            // given
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier("nonexistent");
            credentials.setPassword("anyPassword");

            // when and then
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(credentials)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should reject missing identifier")
        void shouldRejectMissingIdentifier() throws Exception {
            // given
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier(null);
            credentials.setPassword("password");

            // when and then
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(credentials)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject blank identifier")
        void shouldRejectBlankIdentifier() throws Exception {
            // given
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier("   ");
            credentials.setPassword("password");

            // when and then
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(credentials)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject missing password")
        void shouldRejectMissingPassword() throws Exception {
            // given
            createTestAccount();
            
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier("existinguser");
            credentials.setPassword(null);

            // when and then
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(credentials)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject empty password")
        void shouldRejectEmptyPassword() throws Exception {
            // given
            createTestAccount();
            
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier("existinguser");
            credentials.setPassword("");

            // when and then
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(credentials)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Username should not be case-sensitive")
        void usernameShouldNotBeCaseSensitive() throws Exception {
            // given
            createTestAccount(); // username: existinguser
            
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier("ExistingUser"); // different case
            credentials.setPassword("correctPassword123!");

            // when and then
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(credentials)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("SQL injection attempt should be safe")
        void shouldBeSafeFromSqlInjection() throws Exception {
            // given
            createTestAccount();
            
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier("' OR '1'='1' --");
            credentials.setPassword("anything");

            // when and then
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(credentials)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/logout")
    @Transactional
    class LogoutEndpointTests {

        private RefreshToken createTestToken(Account account, String tokenValue) {
            RefreshToken token = new RefreshToken();
            token.setAccount(account);
            token.setToken(tokenValue);
            token.setExpirationDate(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000));
            token.setRevoked(false);
            return refreshTokenRepository.save(token);
        }

        private Account createTestAccount() {
            Account account = new Account();
            account.setUsername("testuser");
            account.setEmail("test@example.com");
            account.setPasswordHash("hash");
            return accountRepository.save(account);
        }

        @Test
        @DisplayName("Should logout successfully")
        void shouldLogoutSuccessfully() throws Exception {
            // given
            Account account = createTestAccount();
            String tokenValue = "valid-token-123";
            createTestToken(account, tokenValue);

            // when and then
            mockMvc.perform(post("/api/auth/logout")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(tokenValue))
                    .andExpect(status().isOk());

            // Verify token was revoked
            RefreshToken revokedToken = refreshTokenRepository.findByToken(tokenValue).orElseThrow();
            assertTrue(revokedToken.isRevoked());
        }

        @Test
        @DisplayName("Should reject non-existent token")
        void shouldRejectNonExistentToken() throws Exception {
            // when and then
            mockMvc.perform(post("/api/auth/logout")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("nonexistent-token"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Logout with already revoked token should succeed")
        void shouldSucceedWithAlreadyRevokedToken() throws Exception {
            // given
            Account account = createTestAccount();
            String tokenValue = "revoked-token";
            RefreshToken token = createTestToken(account, tokenValue);
            token.setRevoked(true);
            refreshTokenRepository.save(token);

            // when and then
            mockMvc.perform(post("/api/auth/logout")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(tokenValue))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Empty token should fail")
        void shouldRejectEmptyToken() throws Exception {
            // when and then
            mockMvc.perform(post("/api/auth/logout")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(""))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Logout with expired token should not succeed")
        void shouldNotSucceedWithExpiredToken() throws Exception {
            // given
            Account account = createTestAccount();
            String tokenValue = "expired-token";
            RefreshToken token = new RefreshToken();
            token.setAccount(account);
            token.setToken(tokenValue);
            token.setExpirationDate(new Date(System.currentTimeMillis() - 1000000));
            token.setRevoked(false);
            refreshTokenRepository.save(token);

            // when and then
            mockMvc.perform(post("/api/auth/logout")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(tokenValue))
                    .andExpect(status().isUnauthorized());
        }
    }
}
