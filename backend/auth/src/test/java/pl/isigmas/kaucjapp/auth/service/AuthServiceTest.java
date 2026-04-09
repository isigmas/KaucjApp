package pl.isigmas.kaucjapp.auth.service;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import pl.isigmas.kaucjapp.auth.client.UserClient;
import pl.isigmas.kaucjapp.auth.dto.request.LoginCredentials;
import pl.isigmas.kaucjapp.auth.dto.request.User;
import pl.isigmas.kaucjapp.auth.dto.request.UsersServiceUser;
import pl.isigmas.kaucjapp.auth.entity.Account;
import pl.isigmas.kaucjapp.auth.entity.RefreshToken;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountRole;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;
import pl.isigmas.kaucjapp.auth.exception.AccountNotActiveException;
import pl.isigmas.kaucjapp.auth.exception.ExpiredTokenException;
import pl.isigmas.kaucjapp.auth.exception.InvalidCredentialsException;
import pl.isigmas.kaucjapp.auth.exception.TokenNotFoundException;
import pl.isigmas.kaucjapp.auth.repository.AccountRepository;
import pl.isigmas.kaucjapp.auth.repository.RefreshTokenRepository;
import pl.isigmas.kaucjapp.auth.security.Encoder;

import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private Encoder encoder;

    @Mock
    private UserClient userClient;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUpAuthServiceSecret() {
        ReflectionTestUtils.setField(authService, "itSecret", "test-it-secret");
    }

    @Nested
    @DisplayName("create() - User Registration Tests")
    class CreateTests {

        private User validUser;

        @BeforeEach
        void setUp() {
            validUser = new User();
            validUser.setUsername("testuser");
            validUser.setEmail("test@example.com");
            validUser.setPassword("password123");
            validUser.setPhone("123456789");
            validUser.setFirstName("John");
            validUser.setLastName("Doe");
        }

        @Test
        @DisplayName("Should create account and call user service")
        void shouldCreateAccountSuccessfully() {
            // given
            Account savedAccount = new Account();
            savedAccount.setId(1L);
            savedAccount.setUsername(validUser.getUsername());
            savedAccount.setEmail(validUser.getEmail());
            savedAccount.setPasswordHash("hashedPassword");

            when(encoder.hashPassword(validUser.getPassword())).thenReturn("hashedPassword");
            when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

            // when
            authService.create(validUser);

            // then
            verify(accountRepository).save(any(Account.class));
            verify(userClient).create(any(UsersServiceUser.class), eq("test-it-secret"));
        }

        @Test
        @DisplayName("Should hash password before saving")
        void shouldHashPasswordBeforeSaving() {
            // given
            Account savedAccount = new Account();
            savedAccount.setId(1L);
            savedAccount.setUsername(validUser.getUsername());
            savedAccount.setEmail(validUser.getEmail());
            savedAccount.setPasswordHash("secureHash");

            when(encoder.hashPassword(validUser.getPassword())).thenReturn("secureHash");
            when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

            // when
            authService.create(validUser);

            // then
            ArgumentCaptor<Account> accountCaptor = ArgumentCaptor.forClass(Account.class);
            verify(accountRepository).save(accountCaptor.capture());

            Account capturedAccount = accountCaptor.getValue();
            assertEquals("secureHash", capturedAccount.getPasswordHash());
            assertNotEquals(validUser.getPassword(), capturedAccount.getPasswordHash());
        }

        @Test
        @DisplayName("Should pass correct data to UserClient")
        void shouldPassCorrectDataToUserClient() {
            // given
            Account savedAccount = new Account();
            savedAccount.setId(42L);
            savedAccount.setUsername(validUser.getUsername());
            savedAccount.setEmail(validUser.getEmail());

            when(encoder.hashPassword(anyString())).thenReturn("hash");
            when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

            // when
            authService.create(validUser);

            // then
            ArgumentCaptor<UsersServiceUser> userCaptor = ArgumentCaptor.forClass(UsersServiceUser.class);
            verify(userClient).create(userCaptor.capture(), eq("test-it-secret"));

            UsersServiceUser capturedUser = userCaptor.getValue();
            assertEquals(42L, capturedUser.getId());
            assertEquals(validUser.getUsername(), capturedUser.getUsername());
            assertEquals(validUser.getEmail(), capturedUser.getEmail());
            assertEquals(validUser.getPhone(), capturedUser.getPhone());
            assertEquals(validUser.getFirstName(), capturedUser.getFirstName());
            assertEquals(validUser.getLastName(), capturedUser.getLastName());
        }

        @Test
        @DisplayName("Should not store plaintext password")
        void shouldNotStorePlaintextPassword() {
            // given
            String plainPassword = "mySecretPassword123";
            validUser.setPassword(plainPassword);
            
            Account savedAccount = new Account();
            savedAccount.setId(1L);
            
            when(encoder.hashPassword(plainPassword)).thenReturn("$2a$12$hashedValue");
            when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

            // when
            authService.create(validUser);

            // then
            ArgumentCaptor<Account> accountCaptor = ArgumentCaptor.forClass(Account.class);
            verify(accountRepository).save(accountCaptor.capture());
            
            assertNotEquals(plainPassword, accountCaptor.getValue().getPasswordHash());
        }

        // TODO: W momencie gdy user-service przyjmie poporanie requesta, i nie zwróci kodu 200, przez błąd, albo auth-service przestanie działać, następuje rozjechanie w danych w obu tych bazach
        @Disabled(" Czeka na implementacje Transactional outbox pattern")
        @Test
        @DisplayName("Should rollback account when UserClient fails - exposes distributed transaction issue")
        void shouldHandleUserClientFailure() {
//            // given
//            Account savedAccount = new Account();
//            savedAccount.setId(100L);
//            savedAccount.setUsername(validUser.getUsername());
//
//            when(encoder.hashPassword(anyString())).thenReturn("hashedPassword");
//            when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);
//
//            String expectedJsonPayload = "{\"username\":\"testuser\",\"email\":\"test@example.com\"}";
//            when(objectMapper.writeValueAsString(any(UsersServiceUser.class))).thenReturn(expectedJsonPayload);
//
//            // when
//            authService.create(validUser);
//
//            // then
//            verify(accountRepository).save(any(Account.class));
//
//            ArgumentCaptor<OutboxMessage> outboxCaptor = ArgumentCaptor.forClass(OutboxMessage.class);
//            verify(outboxRepository).save(outboxCaptor.capture());
//
//            OutboxMessage savedMessage = outboxCaptor.getValue();
//            assertEquals("USER_CREATED", savedMessage.getEventType(), "Event type should be USER_CREATED");
//            assertFalse(savedMessage.isProcessed(), "New outbox message should NOT be processed yet");
//            assertEquals(expectedJsonPayload, savedMessage.getPayload(), "Payload should match the JSON generated by ObjectMapper");
//
//            verifyNoInteractions(userClient);
        }
    }

    @Nested
    @DisplayName("login() - Authentication Tests")
    class LoginTests {

        private LoginCredentials validCredentials;
        private Account existingAccount;

        @BeforeEach
        void setUp() {
            validCredentials = new LoginCredentials();
            validCredentials.setIdentifier("testuser");
            validCredentials.setPassword("correctPassword");
            validCredentials.setDeviceInfo("Chrome on Windows");

            existingAccount = new Account();
            existingAccount.setId(1L);
            existingAccount.setUsername("testuser");
            existingAccount.setEmail("test@example.com");
            existingAccount.setPasswordHash("hashedPassword");
            existingAccount.setRole(AccountRole.USER);
            existingAccount.setStatus(AccountStatus.ACTIVE);
        }

        @Test
        @DisplayName("Should return refresh token on successful login with username")
        void shouldReturnTokenOnSuccessfulLoginWithUsername() {
            // given
            when(accountRepository.findByUsernameOrEmail("testuser", "testuser"))
                    .thenReturn(Optional.of(existingAccount));
            when(encoder.verifyPassword("correctPassword", "hashedPassword")).thenReturn(true);

            // when
            String token = authService.login(validCredentials);

            // then
            assertNotNull(token);
            assertFalse(token.isEmpty());
            verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("Should return refresh token on successful login with email")
        void shouldReturnTokenOnSuccessfulLoginWithEmail() {
            // given
            validCredentials.setIdentifier("test@example.com");
            when(accountRepository.findByUsernameOrEmail("test@example.com", "test@example.com"))
                    .thenReturn(Optional.of(existingAccount));
            when(encoder.verifyPassword("correctPassword", "hashedPassword")).thenReturn(true);

            // when
            String token = authService.login(validCredentials);

            // then
            assertNotNull(token);
        }

        @Test
        @DisplayName("Should throw InvalidCredentialsException when user not found")
        void shouldThrowExceptionWhenUserNotFound() {
            // given
            when(accountRepository.findByUsernameOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.empty());

            // when & then
            assertThrows(InvalidCredentialsException.class, () -> authService.login(validCredentials));
        }

        @Test
        @DisplayName("Should throw InvalidCredentialsException when password is wrong")
        void shouldThrowExceptionWhenPasswordIsWrong() {
            // given
            when(accountRepository.findByUsernameOrEmail("testuser", "testuser"))
                    .thenReturn(Optional.of(existingAccount));
            when(encoder.verifyPassword("correctPassword", "hashedPassword")).thenReturn(false);

            // when & then
            assertThrows(InvalidCredentialsException.class, () -> authService.login(validCredentials));
        }

        @Test
        @DisplayName("Should save refresh token with correct expiration date (7 days)")
        void shouldSaveRefreshTokenWithCorrectExpiration() {
            // given
            when(accountRepository.findByUsernameOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.of(existingAccount));
            when(encoder.verifyPassword(anyString(), anyString())).thenReturn(true);

            long beforeLogin = System.currentTimeMillis();

            // when
            authService.login(validCredentials);

            long afterLogin = System.currentTimeMillis();

            // then
            ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
            verify(refreshTokenRepository).save(tokenCaptor.capture());

            RefreshToken savedToken = tokenCaptor.getValue();
            long expectedMinExpiration = beforeLogin + (7 * 24 * 60 * 60 * 1000);
            long expectedMaxExpiration = afterLogin + (7 * 24 * 60 * 60 * 1000);

            assertTrue(savedToken.getExpirationDate().getTime() >= expectedMinExpiration);
            assertTrue(savedToken.getExpirationDate().getTime() <= expectedMaxExpiration);
        }

        @Test
        @DisplayName("Should save device info in refresh token")
        void shouldSaveDeviceInfoInRefreshToken() {
            // given
            validCredentials.setDeviceInfo("Firefox on Mac");
            when(accountRepository.findByUsernameOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.of(existingAccount));
            when(encoder.verifyPassword(anyString(), anyString())).thenReturn(true);

            // when
            authService.login(validCredentials);

            // then
            ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
            verify(refreshTokenRepository).save(tokenCaptor.capture());

            assertEquals("Firefox on Mac", tokenCaptor.getValue().getDeviceInfo());
        }

        @Test
        @DisplayName("Should generate UUID format token")
        void shouldGenerateUuidToken() {
            // given
            when(accountRepository.findByUsernameOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.of(existingAccount));
            when(encoder.verifyPassword(anyString(), anyString())).thenReturn(true);

            // when
            String token = authService.login(validCredentials);

            // then
            assertTrue(token.matches("[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"));
        }

        @Test
        @DisplayName("Should throw AccountNotActiveException when user is INACTIVE")
        void shouldThrowExceptionWhenUserIsInactive() {
            // given
            existingAccount.setStatus(AccountStatus.INACTIVE);
            when(accountRepository.findByUsernameOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.of(existingAccount));

            lenient().when(encoder.verifyPassword(anyString(), anyString())).thenReturn(true);

            // when & then
            assertThrows(AccountNotActiveException.class, () -> authService.login(validCredentials));
            verifyNoInteractions(refreshTokenRepository);
        }

        @Test
        @DisplayName("Should throw AccountNotActiveException when user is SUSPENDED")
        void shouldThrowExceptionWhenUserIsSuspended() {
            // given
            existingAccount.setStatus(AccountStatus.SUSPENDED);
            when(accountRepository.findByUsernameOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.of(existingAccount));

            lenient().when(encoder.verifyPassword(anyString(), anyString())).thenReturn(true);

            // when & then
            assertThrows(AccountNotActiveException.class, () -> authService.login(validCredentials));

            verifyNoInteractions(refreshTokenRepository);
        }

        @Test
        @DisplayName("Should throw AccountNotActiveException when user is DELETED")
        void shouldThrowExceptionWhenUserIsDeleted() {
            // given
            existingAccount.setStatus(AccountStatus.DELETED);
            when(accountRepository.findByUsernameOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.of(existingAccount));

            lenient().when(encoder.verifyPassword(anyString(), anyString())).thenReturn(true);

            // when & then
            assertThrows(AccountNotActiveException.class, () -> authService.login(validCredentials));

            verifyNoInteractions(refreshTokenRepository);
        }

        @Test
        @DisplayName("Login with null device info should work")
        void shouldAllowLoginWithNullDeviceInfo() {
            // given
            validCredentials.setDeviceInfo(null);
            when(accountRepository.findByUsernameOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.of(existingAccount));
            when(encoder.verifyPassword(anyString(), anyString())).thenReturn(true);

            // when
            String token = authService.login(validCredentials);

            // then
            assertNotNull(token);
        }

        @Test
        @DisplayName("Login with empty device info should work")
        void shouldAllowLoginWithEmptyDeviceInfo() {
            // given
            validCredentials.setDeviceInfo("");
            when(accountRepository.findByUsernameOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.of(existingAccount));
            when(encoder.verifyPassword(anyString(), anyString())).thenReturn(true);

            // when
            String token = authService.login(validCredentials);

            // then
            assertNotNull(token);
        }

        @Test
        @DisplayName("Should link refresh token to correct account")
        void shouldLinkRefreshTokenToCorrectAccount() {
            // given
            when(accountRepository.findByUsernameOrEmail(anyString(), anyString()))
                    .thenReturn(Optional.of(existingAccount));
            when(encoder.verifyPassword(anyString(), anyString())).thenReturn(true);

            // when
            authService.login(validCredentials);

            // then
            ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
            verify(refreshTokenRepository).save(tokenCaptor.capture());

            assertEquals(existingAccount, tokenCaptor.getValue().getAccount());
        }
    }

    @Nested
    @DisplayName("logout() - Logout Tests")
    class LogoutTests {

        private RefreshToken existingToken;

        @BeforeEach
        void setUp() {
            Account account = new Account();
            account.setId(1L);

            existingToken = new RefreshToken();
            existingToken.setId(1L);
            existingToken.setToken("valid-token-123");
            existingToken.setAccount(account);
            existingToken.setRevoked(false);
            existingToken.setExpirationDate(new Date(System.currentTimeMillis() + 1000000));
        }

        @Test
        @DisplayName("Should revoke token on logout")
        void shouldRevokeTokenOnLogout() {
            // given
            when(refreshTokenRepository.findByToken("valid-token-123"))
                    .thenReturn(Optional.of(existingToken));

            // when
            authService.logout("valid-token-123");

            // then
            assertTrue(existingToken.isRevoked());
        }

        @Test
        @DisplayName("Should throw TokenNotFoundException when token not found")
        void shouldThrowExceptionWhenTokenNotFound() {
            // given
            when(refreshTokenRepository.findByToken(anyString())).thenReturn(Optional.empty());

            // when & then
            assertThrows(TokenNotFoundException.class, () -> authService.logout("nonexistent-token"));
        }

        @Test
        @DisplayName("Logout with already revoked token should succeed")
        void shouldAllowLogoutWithAlreadyRevokedToken() {
            // given
            existingToken.setRevoked(true);
            when(refreshTokenRepository.findByToken("valid-token-123"))
                    .thenReturn(Optional.of(existingToken));

            // when
            authService.logout("valid-token-123");

            // then
            assertTrue(existingToken.isRevoked());
        }

        @Test
        @DisplayName("Should throw exception and not revoke when token is expired")
        void shouldFailLogoutWithExpiredToken() {
            // given
            existingToken.setExpirationDate(new Date(System.currentTimeMillis() - 1000000));
            existingToken.setRevoked(false);

            when(refreshTokenRepository.findByToken("valid-token-123"))
                    .thenReturn(Optional.of(existingToken));

            // when & then
            assertThrows(ExpiredTokenException.class, () -> {
                authService.logout("valid-token-123");
            });

            assertFalse(existingToken.isRevoked(), "Token should NOT be revoked if it was already expired");

            verify(refreshTokenRepository, never()).save(any());
        }

        @Test
        @DisplayName("Logout with empty token string")
        void shouldThrowExceptionForEmptyToken() {
            // given
            when(refreshTokenRepository.findByToken("")).thenReturn(Optional.empty());

            // when & then
            assertThrows(TokenNotFoundException.class, () -> authService.logout(""));
        }

        @Test
        @DisplayName("Logout with whitespace-only token")
        void shouldThrowExceptionForWhitespaceToken() {
            // given
            when(refreshTokenRepository.findByToken("   ")).thenReturn(Optional.empty());

            // when & then
            assertThrows(TokenNotFoundException.class, () -> authService.logout("   "));
        }
    }
}
