package pl.isigmas.kaucjapp.auth.repository;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.auth.TestcontainersConfiguration;
import pl.isigmas.kaucjapp.auth.entity.Account;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountRole;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
@DisplayName("AccountRepository Integration Tests with Testcontainers")
class AccountRepositoryIntegrationTest {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private EntityManager entityManager;

    private Account createAccount(String username, String email) {
        Account account = new Account();
        account.setUsername(username);
        account.setEmail(email);
        account.setPasswordHash("$2a$12$hashedPassword");
        account.setRole(AccountRole.USER);
        account.setStatus(AccountStatus.ACTIVE);
        return account;
    }

    @Nested
    @DisplayName("findByUsernameIgnoreCaseOrEmailIgnoreCase() Tests")
    class findByUsernameIgnoreCaseOrEmailIgnoreCaseTests {

        @BeforeEach
        void setUp() {
            accountRepository.deleteAll();
            entityManager.flush();
        }

        @Test
        @DisplayName("Should find account by username")
        void shouldFindAccountByUsername() {
            // given
            Account account = createAccount("testuser", "test@example.com");
            accountRepository.saveAndFlush(account);

            // when
            Optional<Account> result = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("testuser", "testuser");

            // then
            assertTrue(result.isPresent());
            assertEquals("testuser", result.get().getUsername());
        }

        @Test
        @DisplayName("Should find account by email")
        void shouldFindAccountByEmail() {
            // given
            Account account = createAccount("testuser", "test@example.com");
            accountRepository.saveAndFlush(account);

            // when
            Optional<Account> result = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("test@example.com", "test@example.com");

            // then
            assertTrue(result.isPresent());
            assertEquals("test@example.com", result.get().getEmail());
        }

        @Test
        @DisplayName("Should return empty when account not found")
        void shouldReturnEmptyWhenNotFound() {
            // when
            Optional<Account> result = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("nonexistent", "nonexistent");

            // then
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Should find when username matches first argument")
        void shouldFindWhenUsernameMatchesFirstArgument() {
            // given
            Account account = createAccount("user1", "user1@test.com");
            accountRepository.saveAndFlush(account);

            // when
            Optional<Account> result = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("user1", "different@email.com");

            // then
            assertTrue(result.isPresent());
            assertEquals("user1", result.get().getUsername());
        }

        @Test
        @DisplayName("Should find when email matches second argument")
        void shouldFindWhenEmailMatchesSecondArgument() {
            // given
            Account account = createAccount("user1", "user1@test.com");
            accountRepository.saveAndFlush(account);

            // when
            Optional<Account> result = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("differentuser", "user1@test.com");

            // then
            assertTrue(result.isPresent());
            assertEquals("user1@test.com", result.get().getEmail());
        }


        @Test
        @DisplayName("Email search is case-sensitive")
        void emailShouldNotBeCaseSensitive() {
            // given
            Account account = createAccount("testuser", "Test@Example.com");
            accountRepository.saveAndFlush(account);

            // when
            Optional<Account> result = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("test@example.com", "test@example.com");

            // then
            assertTrue(result.isPresent());
        }

        @Test
        @DisplayName("Empty string username should not find anything")
        void shouldNotFindEmptyUsername() {
            // given
            Account account = createAccount("testuser", "test@example.com");
            accountRepository.saveAndFlush(account);

            // when
            Optional<Account> result = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("", "");

            // then
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Username with special characters")
        void shouldFindUsernameWithSpecialCharacters() {
            // given
            Account account = createAccount("user_123-test", "user@example.com");
            accountRepository.saveAndFlush(account);

            // when
            Optional<Account> result = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("user_123-test", "user_123-test");

            // then
            assertTrue(result.isPresent());
        }

        @Test
        @DisplayName("SQL injection attempt should be safe")
        void shouldBeSafeFromSqlInjection() {
            // given
            Account account = createAccount("testuser", "test@example.com");
            accountRepository.saveAndFlush(account);

            // when
            String maliciousInput = "' OR '1'='1";
            Optional<Account> result = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(maliciousInput, maliciousInput);

            // then
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Username at max length (100 chars)")
        void shouldFindUsernameAtMaxLength() {
            // given
            String longUsername = "a".repeat(100);
            Account account = createAccount(longUsername, "test@example.com");
            accountRepository.saveAndFlush(account);

            // when
            Optional<Account> result = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(longUsername, longUsername);

            // then
            assertTrue(result.isPresent());
        }
    }

    @Nested
    @DisplayName("Account Entity Constraints Tests")
    class AccountConstraintsTests {

        @BeforeEach
        void setUp() {
            accountRepository.deleteAll();
            entityManager.flush();
        }

        @Test
        @DisplayName("Should enforce unique username constraint")
        void shouldEnforceUniqueUsername() {
            // given
            Account account1 = createAccount("duplicateuser", "email1@test.com");
            Account account2 = createAccount("duplicateuser", "email2@test.com");

            accountRepository.saveAndFlush(account1);

            // when and then
            assertThrows(DataIntegrityViolationException.class, () -> {
                accountRepository.saveAndFlush(account2);
            });
        }

        @Test
        @DisplayName("Should enforce unique email constraint")
        void shouldEnforceUniqueEmail() {
            // given
            Account account1 = createAccount("user1", "duplicate@test.com");
            Account account2 = createAccount("user2", "duplicate@test.com");

            accountRepository.saveAndFlush(account1);

            // when and then
            assertThrows(DataIntegrityViolationException.class, () -> {
                accountRepository.saveAndFlush(account2);
            });
        }

        @Test
        @DisplayName("Should set default role to USER")
        void shouldSetDefaultRoleToUser() {
            // given
            Account account = new Account();
            account.setUsername("newuser");
            account.setEmail("new@test.com");
            account.setPasswordHash("hash");

            // when
            Account saved = accountRepository.saveAndFlush(account);

            // then
            assertEquals(AccountRole.USER, saved.getRole());
        }

        @Test
        @DisplayName("Should set default status to INACTIVE")
        void shouldSetDefaultStatusToInactive() {
            // given
            Account account = new Account();
            account.setUsername("newuser");
            account.setEmail("new@test.com");
            account.setPasswordHash("hash");

            // when
            Account saved = accountRepository.saveAndFlush(account);

            // then
            assertEquals(AccountStatus.INACTIVE, saved.getStatus());
        }

        @Test
        @DisplayName("Should auto-generate ID")
        void shouldAutoGenerateId() {
            // given
            Account account = createAccount("newuser", "new@test.com");
            assertNull(account.getId());

            // when
            Account saved = accountRepository.saveAndFlush(account);

            // then
            assertNotNull(saved.getId());
        }
    }
}
