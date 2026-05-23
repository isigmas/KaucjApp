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
import pl.isigmas.kaucjapp.auth.entity.RefreshToken;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountRole;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@org.springframework.kafka.test.context.EmbeddedKafka(partitions = 1)
@Import(TestcontainersConfiguration.class)
@Transactional
@DisplayName("RefreshTokenRepository Integration Tests with Testcontainers")
class RefreshTokenRepositoryIntegrationTest {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private EntityManager entityManager;

    private Account testAccount;

    private Account createAndSaveAccount(String username, String email) {
        Account account = new Account();
        account.setUsername(username);
        account.setEmail(email);
        account.setPasswordHash("$2a$12$hashedPassword");
        account.setRole(AccountRole.USER);
        account.setStatus(AccountStatus.ACTIVE);
        return accountRepository.saveAndFlush(account);
    }

    private RefreshToken createToken(Account account, String token) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setAccount(account);
        refreshToken.setToken(token);
        refreshToken.setExpirationDate(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000));
        refreshToken.setRevoked(false);
        return refreshToken;
    }

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        accountRepository.deleteAll();
        entityManager.flush();
        testAccount = createAndSaveAccount("testuser", "test@example.com");
    }

    @Nested
    @DisplayName("findByToken() Tests")
    class FindByTokenTests {

        @Test
        @DisplayName("Should find token by token string")
        void shouldFindTokenByTokenString() {
            // given
            String tokenValue = UUID.randomUUID().toString();
            RefreshToken token = createToken(testAccount, tokenValue);
            refreshTokenRepository.saveAndFlush(token);

            // when
            Optional<RefreshToken> result = refreshTokenRepository.findByToken(tokenValue);

            // then
            assertTrue(result.isPresent());
            assertEquals(tokenValue, result.get().getToken());
        }

        @Test
        @DisplayName("Should return empty when token not found")
        void shouldReturnEmptyWhenNotFound() {
            // when
            Optional<RefreshToken> result = refreshTokenRepository.findByToken("nonexistent-token");

            // then
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Should find correct token among multiple tokens")
        void shouldFindCorrectTokenAmongMultiple() {
            // given
            String targetToken = "target-token-123";
            RefreshToken token1 = createToken(testAccount, "token-1");
            RefreshToken token2 = createToken(testAccount, targetToken);
            RefreshToken token3 = createToken(testAccount, "token-3");

            refreshTokenRepository.saveAndFlush(token1);
            refreshTokenRepository.saveAndFlush(token2);
            refreshTokenRepository.saveAndFlush(token3);

            // when
            Optional<RefreshToken> result = refreshTokenRepository.findByToken(targetToken);

            // then
            assertTrue(result.isPresent());
            assertEquals(targetToken, result.get().getToken());
        }

        @Test
        @DisplayName("when and thenEmpty token string should not find anything")
        void shouldNotFindEmptyToken() {
            // given
            RefreshToken token = createToken(testAccount, "valid-token");
            refreshTokenRepository.saveAndFlush(token);

            // when
            Optional<RefreshToken> result = refreshTokenRepository.findByToken("");

            // then
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("when and thenToken with leading/trailing whitespace")
        void shouldNotFindTokenWithWhitespace() {
            // given
            String tokenValue = "my-token";
            RefreshToken token = createToken(testAccount, tokenValue);
            refreshTokenRepository.saveAndFlush(token);

            // when
            Optional<RefreshToken> resultWithSpace = refreshTokenRepository.findByToken(" my-token");
            Optional<RefreshToken> resultWithTrailingSpace = refreshTokenRepository.findByToken("my-token ");

            // then
            assertTrue(resultWithSpace.isEmpty());
            assertTrue(resultWithTrailingSpace.isEmpty());
        }

        @Test
        @DisplayName("when and thenToken search is case-sensitive")
        void tokenSearchShouldBeCaseSensitive() {
            // given
            RefreshToken token = createToken(testAccount, "MyToken123");
            refreshTokenRepository.saveAndFlush(token);

            // when
            Optional<RefreshToken> result = refreshTokenRepository.findByToken("mytoken123");

            // then
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("when and thenSQL injection attempt should be safe")
        void shouldBeSafeFromSqlInjection() {
            // given
            RefreshToken token = createToken(testAccount, "valid-token");
            refreshTokenRepository.saveAndFlush(token);

            // when
            String malicious = "' OR '1'='1' --";
            Optional<RefreshToken> result = refreshTokenRepository.findByToken(malicious);

            // then
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("when and thenToken at max length (255 chars)")
        void shouldFindTokenAtMaxLength() {
            // given
            String longToken = "a".repeat(255);
            RefreshToken token = createToken(testAccount, longToken);
            refreshTokenRepository.saveAndFlush(token);

            // when
            Optional<RefreshToken> result = refreshTokenRepository.findByToken(longToken);

            // then
            assertTrue(result.isPresent());
        }
    }

    @Nested
    @DisplayName("RefreshToken Entity Constraints Tests")
    class RefreshTokenConstraintsTests {

        @Test
        @DisplayName("Should enforce unique token constraint")
        void shouldEnforceUniqueToken() {
            // given
            String duplicateToken = "duplicate-token";
            RefreshToken token1 = createToken(testAccount, duplicateToken);
            RefreshToken token2 = createToken(testAccount, duplicateToken);

            refreshTokenRepository.saveAndFlush(token1);

            // when & then
            assertThrows(DataIntegrityViolationException.class, () -> {
                refreshTokenRepository.saveAndFlush(token2);
            });
        }

        @Test
        @DisplayName("Should allow multiple tokens for same account")
        void shouldAllowMultipleTokensForSameAccount() {
            // given
            RefreshToken token1 = createToken(testAccount, "token-1");
            RefreshToken token2 = createToken(testAccount, "token-2");
            RefreshToken token3 = createToken(testAccount, "token-3");

            // when
            refreshTokenRepository.saveAndFlush(token1);
            refreshTokenRepository.saveAndFlush(token2);
            refreshTokenRepository.saveAndFlush(token3);

            // then
            assertEquals(3, refreshTokenRepository.count());
        }

        @Test
        @DisplayName("Should set default revoked to false")
        void shouldSetDefaultRevokedToFalse() {
            // given
            RefreshToken token = new RefreshToken();
            token.setAccount(testAccount);
            token.setToken("new-token");
            token.setExpirationDate(new Date(System.currentTimeMillis() + 1000000));

            // when
            RefreshToken saved = refreshTokenRepository.saveAndFlush(token);

            // then
            assertFalse(saved.isRevoked());
        }

        @Test
        @DisplayName("Should set creation date automatically")
        void shouldSetCreationDateAutomatically() {
            // given
            RefreshToken token = new RefreshToken();
            token.setAccount(testAccount);
            token.setToken("new-token");
            token.setExpirationDate(new Date(System.currentTimeMillis() + 1000000));

            // when
            RefreshToken saved = refreshTokenRepository.saveAndFlush(token);

            // then
            assertNotNull(saved.getCreationDate());
        }

        @Test
        @DisplayName("Should auto-generate ID")
        void shouldAutoGenerateId() {
            // given
            RefreshToken token = createToken(testAccount, "new-token");
            assertNull(token.getId());

            // when
            RefreshToken saved = refreshTokenRepository.saveAndFlush(token);

            // then
            assertNotNull(saved.getId());
        }

        @Test
        @DisplayName("when and thenNull device info should be allowed")
        void shouldAllowNullDeviceInfo() {
            // given
            RefreshToken token = createToken(testAccount, "token");
            token.setDeviceInfo(null);

            // when
            RefreshToken saved = refreshTokenRepository.saveAndFlush(token);

            // then
            assertNull(saved.getDeviceInfo());
        }

        @Test
        @DisplayName("when and thenAlready expired date can be stored")
        void shouldAllowExpiredDate() {
            // given
            RefreshToken token = new RefreshToken();
            token.setAccount(testAccount);
            token.setToken("expired-token");
            token.setExpirationDate(new Date(System.currentTimeMillis() - 1000000));

            // when
            RefreshToken saved = refreshTokenRepository.saveAndFlush(token);

            // then
            assertNotNull(saved.getId());
        }
    }

    @Nested
    @DisplayName("Cascade Delete Tests")
    class CascadeDeleteTests {

        @Test
        @DisplayName("Should delete tokens when account is deleted (OnDelete CASCADE)")
        void shouldCascadeDeleteTokensWhenAccountDeleted() {
            // given
            RefreshToken token = createToken(testAccount, "token-to-delete");
            refreshTokenRepository.saveAndFlush(token);
            Long tokenId = token.getId();

            // when
            accountRepository.delete(testAccount);
            entityManager.flush();
            entityManager.clear();

            // then
            Optional<RefreshToken> deletedToken = refreshTokenRepository.findById(tokenId);
            assertTrue(deletedToken.isEmpty());
        }
    }
}
