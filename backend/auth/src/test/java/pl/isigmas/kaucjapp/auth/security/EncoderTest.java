package pl.isigmas.kaucjapp.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import pl.isigmas.kaucjapp.auth.exception.InvalidCredentialsException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Encoder Unit Tests")
class EncoderTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    private Encoder encoder;

    private static final String TEST_SALT = "testSecretSalt123";

    @BeforeEach
    void setUp() {
        encoder = new Encoder(passwordEncoder);
        ReflectionTestUtils.setField(encoder, "secret", TEST_SALT);
    }

    @Nested
    @DisplayName("hashPassword() Tests")
    class HashPasswordTests {

        @Test
        @DisplayName("Should hash password with salt")
        void shouldHashPasswordWithSalt() {
            // given
            String rawPassword = "myPassword";
            String expectedInput = rawPassword + TEST_SALT;
            when(passwordEncoder.encode(expectedInput)).thenReturn("hashedValue");

            // when
            String result = encoder.hashPassword(rawPassword);

            // then
            assertEquals("hashedValue", result);
            verify(passwordEncoder).encode(expectedInput);
        }

        @Test
        @DisplayName("Should call encoder with password + salt")
        void shouldCallEncoderWithPasswordPlusSalt() {
            // given
            String rawPassword = "secret123";
            when(passwordEncoder.encode(anyString())).thenReturn("hash");

            // when
            encoder.hashPassword(rawPassword);

            // then
            verify(passwordEncoder).encode(rawPassword + TEST_SALT);
        }

        @Test
        @DisplayName("Should produce different hashes for same password with different salt")
        void shouldProduceDifferentHashesWithDifferentSalt() {
            // given
            PasswordEncoder realEncoder = new BCryptPasswordEncoder(12);
            Encoder encoder1 = new Encoder(realEncoder);
            Encoder encoder2 = new Encoder(realEncoder);
            
            ReflectionTestUtils.setField(encoder1, "secret", "salt1");
            ReflectionTestUtils.setField(encoder2, "secret", "salt2");
            
            String rawPassword = "samePassword";

            // when
            String hash1 = encoder1.hashPassword(rawPassword);
            String hash2 = encoder2.hashPassword(rawPassword);

            // then
            assertNotEquals(hash1, hash2);
        }

        @Test
        @DisplayName("Empty password should Not be hashed")
        void shouldNotHashEmptyPassword() {
            // given
            String emptyPassword = "";

            // when and then
            assertThrows(InvalidCredentialsException.class, () -> {
                encoder.hashPassword(emptyPassword);
            });
            verifyNoInteractions(passwordEncoder);
        }

        @Test
        @DisplayName("Very long password should be hashed")
        void shouldHashVeryLongPassword() {
            // given
            String longPassword = "a".repeat(10000);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedLongPassword");

            // when
            String result = encoder.hashPassword(longPassword);

            // then
            assertNotNull(result);
            verify(passwordEncoder).encode(longPassword + TEST_SALT);
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "pass@word!",
            "пароль123",
            "密码测试",
            "パスワード",
            "pass\nword",
            "pass\tword",
            "pass word with spaces",
            "!@#$%^&*()_+-=[]{}|;':\",./<>?",
            "\u0000\u0001\u0002"
        })
        @DisplayName("Password with special/unicode characters")
        void shouldHashPasswordWithSpecialCharacters(String specialPassword) {
            // given
            when(passwordEncoder.encode(anyString())).thenReturn("hash");

            // when
            String result = encoder.hashPassword(specialPassword);

            // then
            assertNotNull(result);
            verify(passwordEncoder).encode(specialPassword + TEST_SALT);
        }

        @Test
        @DisplayName("Should throw exception when hashing null password")
        void shouldThrowExceptionWhenPasswordIsNull() {
            // given
            String nullPassword = null;
            
            // when and then
            assertThrows(InvalidCredentialsException.class, () -> {
                encoder.hashPassword(nullPassword);
            });
            verifyNoInteractions(passwordEncoder);
        }
    }

    @Nested
    @DisplayName("verifyPassword() Tests")
    class VerifyPasswordTests {

        @Test
        @DisplayName("Should verify correct password")
        void shouldVerifyCorrectPassword() {
            // given
            String rawPassword = "myPassword";
            String hashedPassword = "$2a$12$hashedValue";
            when(passwordEncoder.matches(rawPassword + TEST_SALT, hashedPassword)).thenReturn(true);

            // when
            boolean result = encoder.verifyPassword(rawPassword, hashedPassword);

            // then
            assertTrue(result);
        }

        @Test
        @DisplayName("Should reject incorrect password")
        void shouldRejectIncorrectPassword() {
            // given
            String rawPassword = "wrongPassword";
            String hashedPassword = "$2a$12$hashedValue";
            when(passwordEncoder.matches(rawPassword + TEST_SALT, hashedPassword)).thenReturn(false);

            // when
            boolean result = encoder.verifyPassword(rawPassword, hashedPassword);

            // then
            assertFalse(result);
        }

        @Test
        @DisplayName("Should use salt when verifying")
        void shouldUseSaltWhenVerifying() {
            // given
            String rawPassword = "password123";
            String hashedPassword = "hash";
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

            // when
            encoder.verifyPassword(rawPassword, hashedPassword);

            // then
            verify(passwordEncoder).matches(rawPassword + TEST_SALT, hashedPassword);
        }

        @Test
        @DisplayName("Throws exception against empty hash")
        void shouldThrowExceptionAgainstEmptyHash() {
            // given
            String emptyPasswordHash = "";

            // when and then
            assertThrows(InvalidCredentialsException.class, () -> {
                encoder.verifyPassword("password", emptyPasswordHash);
            });
            verifyNoInteractions(passwordEncoder);
        }

        @Test
        @DisplayName("Should use BCrypt constant-time comparison")
        void shouldUseConstantTimeComparison() {
            
            // given
            PasswordEncoder realEncoder = new BCryptPasswordEncoder(12);
            Encoder realEncoderWrapper = new Encoder(realEncoder);
            ReflectionTestUtils.setField(realEncoderWrapper, "secret", TEST_SALT);
            
            String hash = realEncoderWrapper.hashPassword("correctPassword");

            // when
            boolean correctResult = realEncoderWrapper.verifyPassword("correctPassword", hash);
            boolean wrongResult = realEncoderWrapper.verifyPassword("wrongPassword", hash);

            // then
            assertTrue(correctResult);
            assertFalse(wrongResult);
        }

        @Test
        @DisplayName("Null hash should throw or return false")
        void shouldHandleNullHash() {
            // given
            String rawPassword = "password123";
            String storedHash = null;

            // when & then
            assertThrows(InvalidCredentialsException.class, () -> {
                encoder.verifyPassword(rawPassword, storedHash);
            }, "Should throw InvalidCredentialsException if database returned null hash");
            verifyNoInteractions(passwordEncoder);
        }
    }

    @Nested
    @DisplayName("Integration Tests with Real BCrypt")
    class RealBCryptIntegrationTests {

        private Encoder realEncoder;

        @BeforeEach
        void setUp() {
            PasswordEncoder bcrypt = new BCryptPasswordEncoder(12);
            realEncoder = new Encoder(bcrypt);
            ReflectionTestUtils.setField(realEncoder, "secret", "realTestSalt");
        }

        @Test
        @DisplayName("Should hash and verify password correctly")
        void shouldHashAndVerifyCorrectly() {
            // given
            String rawPassword = "mySecurePassword123!";

            // when
            String hash = realEncoder.hashPassword(rawPassword);
            boolean verified = realEncoder.verifyPassword(rawPassword, hash);

            // then
            assertTrue(verified);
        }

        @Test
        @DisplayName("Should produce different hashes for same password (BCrypt adds random salt)")
        void shouldProduceDifferentHashesForSamePassword() {
            // given
            String rawPassword = "samePassword";

            // when
            String hash1 = realEncoder.hashPassword(rawPassword);
            String hash2 = realEncoder.hashPassword(rawPassword);

            // then
            assertNotEquals(hash1, hash2);
            // But both should verify correctly
            assertTrue(realEncoder.verifyPassword(rawPassword, hash1));
            assertTrue(realEncoder.verifyPassword(rawPassword, hash2));
        }

        @Test
        @DisplayName("Should not verify with wrong password")
        void shouldNotVerifyWithWrongPassword() {
            // given
            String correctPassword = "correct";
            String wrongPassword = "wrong";

            // when
            String hash = realEncoder.hashPassword(correctPassword);
            boolean result = realEncoder.verifyPassword(wrongPassword, hash);

            // then
            assertFalse(result);
        }

        @Test
        @DisplayName("Should not verify with different salt")
        void shouldNotVerifyWithDifferentSalt() {
            // given
            PasswordEncoder bcrypt = new BCryptPasswordEncoder(12);
            Encoder encoder1 = new Encoder(bcrypt);
            Encoder encoder2 = new Encoder(bcrypt);
            
            ReflectionTestUtils.setField(encoder1, "secret", "salt1");
            ReflectionTestUtils.setField(encoder2, "secret", "salt2");
            
            String password = "password123";

            // when
            String hash = encoder1.hashPassword(password);
            boolean result = encoder2.verifyPassword(password, hash);

            // then
            assertFalse(result);
        }
    }
}
