package pl.isigmas.kaucjapp.auth.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import pl.isigmas.kaucjapp.auth.TestcontainersConfiguration;
import pl.isigmas.kaucjapp.auth.dto.request.LoginCredentials;
import pl.isigmas.kaucjapp.auth.dto.request.User;
import pl.isigmas.kaucjapp.auth.dto.request.UsersServiceUser;
import pl.isigmas.kaucjapp.auth.validation.CleanUsername;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("DTO Validation Tests")
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class DtoValidationTest {

    @Autowired
    private Validator validator;

    @Nested
    @DisplayName("User DTO Validation Tests")
    class UserValidationTests {

        private User createValidUser() {
            User user = new User();
            user.setUsername("validuser");
            user.setEmail("valid@example.com");
            user.setPassword("Password123!");
            user.setPhone("123456789");
            user.setFirstName("John");
            user.setLastName("Doe");
            return user;
        }

        @Test
        @DisplayName("Valid user should have no violations")
        void validUserShouldHaveNoViolations() {
            // given
            User user = createValidUser();

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertTrue(violations.isEmpty());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   ", "\t", "\n"})
        @DisplayName("Invalid username values")
        void invalidUsernameShouldFail(String username) {
            // given
            User user = createValidUser();
            user.setUsername(username);

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("username")));
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("Null or empty email")
        void nullOrEmptyEmailShouldFail(String email) {
            // given
            User user = createValidUser();
            user.setEmail(email);

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "notanemail",
            // Note: "missing@domain" is valid per RFC 5321 (local domains are allowed) - Validated by Hibernate
            "@nodomain.com",
            "spaces in@email.com",
            "double@@at.com"
        })
        @DisplayName("Invalid email formats")
        void invalidEmailFormatShouldFail(String email) {
            // given
            User user = createValidUser();
            user.setEmail(email);

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("email")));
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "valid@example.com",
            "user.name@domain.org",
            "user+tag@example.co.uk",
            "user123@test.io"
        })
        @DisplayName("Valid email formats should pass")
        void validEmailFormatsShouldPass(String email) {
            // given
            User user = createValidUser();
            user.setEmail(email);

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertTrue(violations.stream()
                    .noneMatch(v -> v.getPropertyPath().toString().equals("email")));
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   "})
        @DisplayName("Invalid password values")
        void invalidPasswordShouldFail(String password) {
            // given
            User user = createValidUser();
            user.setPassword(password);

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("Null or empty phone")
        void nullOrEmptyPhoneShouldFail(String phone) {
            // given
            User user = createValidUser();
            user.setPhone(phone);

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "12345678",
            "1234567890123456",
            "123abc456",
            "+48123456789",
            "123-456-789",
            "(123)456789",
            "123 456 789"
        })
        @DisplayName("Invalid phone formats")
        void invalidPhoneFormatsShouldFail(String phone) {
            // given
            User user = createValidUser();
            user.setPhone(phone);

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("phone")));
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "123456789",
            "123456789012345"
        })
        @DisplayName("Valid phone formats should pass")
        void validPhoneFormatsShouldPass(String phone) {
            // given
            User user = createValidUser();
            user.setPhone(phone);

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertTrue(violations.stream()
                    .noneMatch(v -> v.getPropertyPath().toString().equals("phone")));
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   "})
        @DisplayName("Invalid first name values")
        void invalidFirstNameShouldFail(String firstName) {
            // given
            User user = createValidUser();
            user.setFirstName(firstName);

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   "})
        @DisplayName("Invalid last name values")
        void invalidLastNameShouldFail(String lastName) {
            // given
            User user = createValidUser();
            user.setLastName(lastName);

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("Unicode characters in names")
        void unicodeCharactersShouldBeValid() {
            // given
            User user = createValidUser();
            user.setFirstName("Żółć");
            user.setLastName("山田");

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertTrue(violations.isEmpty());
        }

        @ParameterizedTest
        @ValueSource(strings = {"admin", "chuj123", "4dm1n", "kurwator"})
        @DisplayName("Username with profanity or reserved name fails @CleanUsername")
        void profaneOrReservedUsernameShouldFail(String username) {
            User user = createValidUser();
            user.setUsername(username);

            Set<ConstraintViolation<User>> violations = validator.validate(user);

            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> "username".equals(v.getPropertyPath().toString())
                            && v.getConstraintDescriptor().getAnnotation() instanceof CleanUsername));
        }

        @ParameterizedTest
        @ValueSource(strings = {"janek123", "student99", "kowalski"})
        @DisplayName("Clean usernames pass all validation including @CleanUsername")
        void cleanUsernameShouldPass(String username) {
            User user = createValidUser();
            user.setUsername(username);

            Set<ConstraintViolation<User>> violations = validator.validate(user);

            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Username should not exceed 100 characters")
        void usernameShouldNotExceedMaxLength() {
            // given
            User user = createValidUser();
            user.setUsername("a".repeat(101));

            // when
            Set<ConstraintViolation<User>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty(), "Validator should find violations when username exceeds 100 characters");
            boolean hasUsernameViolation = violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("username"));

            assertTrue(hasUsernameViolation, "There should be a validation error specifically for the 'username' field");
        }
    }

    @Nested
    @DisplayName("LoginCredentials DTO Validation Tests")
    class LoginCredentialsValidationTests {

        private LoginCredentials createValidCredentials() {
            LoginCredentials credentials = new LoginCredentials();
            credentials.setIdentifier("user");
            credentials.setPassword("password");
            return credentials;
        }

        @Test
        @DisplayName("Valid credentials should have no violations")
        void validCredentialsShouldHaveNoViolations() {
            // given
            LoginCredentials credentials = createValidCredentials();

            // when
            Set<ConstraintViolation<LoginCredentials>> violations = validator.validate(credentials);

            // then
            assertTrue(violations.isEmpty());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   ", "\t"})
        @DisplayName("Invalid identifier values")
        void invalidIdentifierShouldFail(String identifier) {
            // given
            LoginCredentials credentials = createValidCredentials();
            credentials.setIdentifier(identifier);

            // when
            Set<ConstraintViolation<LoginCredentials>> violations = validator.validate(credentials);

            // then
            assertFalse(violations.isEmpty());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   "})
        @DisplayName("Invalid password values")
        void invalidPasswordShouldFail(String password) {
            // given
            LoginCredentials credentials = createValidCredentials();
            credentials.setPassword(password);

            // when
            Set<ConstraintViolation<LoginCredentials>> violations = validator.validate(credentials);

            // then
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("Device info can be null")
        void deviceInfoCanBeNull() {
            // given
            LoginCredentials credentials = createValidCredentials();
            credentials.setDeviceInfo(null);

            // when
            Set<ConstraintViolation<LoginCredentials>> violations = validator.validate(credentials);

            // then
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Device info at max size (255)")
        void deviceInfoAtMaxSize() {
            // given
            LoginCredentials credentials = createValidCredentials();
            credentials.setDeviceInfo("a".repeat(255));

            // when
            Set<ConstraintViolation<LoginCredentials>> violations = validator.validate(credentials);

            // then
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Device info exceeding max size (256)")
        void deviceInfoExceedingMaxSize() {
            // given
            LoginCredentials credentials = createValidCredentials();
            credentials.setDeviceInfo("a".repeat(256));

            // when
            Set<ConstraintViolation<LoginCredentials>> violations = validator.validate(credentials);

            // then
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("deviceInfo")));
        }
    }

    @Nested
    @DisplayName("UsersServiceUser DTO Validation Tests")
    class UsersServiceUserValidationTests {

        private UsersServiceUser createValidUsersServiceUser() {
            UsersServiceUser user = new UsersServiceUser();
            user.setId(1L);
            user.setUsername("testuser");
            user.setFirstName("John");
            user.setLastName("Doe");
            user.setPhone("123456789");
            user.setEmail("test@example.com");
            return user;
        }

        @Test
        @DisplayName("Valid UsersServiceUser should have no violations")
        void validUserShouldHaveNoViolations() {
            // given
            UsersServiceUser user = createValidUsersServiceUser();

            // when
            Set<ConstraintViolation<UsersServiceUser>> violations = validator.validate(user);

            // then
            assertTrue(violations.isEmpty());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("Invalid username values")
        void invalidUsernameShouldFail(String username) {
            // given
            UsersServiceUser user = createValidUsersServiceUser();
            user.setUsername(username);

            // when
            Set<ConstraintViolation<UsersServiceUser>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("Invalid first name values")
        void invalidFirstNameShouldFail(String firstName) {
            // given
            UsersServiceUser user = createValidUsersServiceUser();
            user.setFirstName(firstName);

            // when
            Set<ConstraintViolation<UsersServiceUser>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("Invalid last name values")
        void invalidLastNameShouldFail(String lastName) {
            // given
            UsersServiceUser user = createValidUsersServiceUser();
            user.setLastName(lastName);

            // when
            Set<ConstraintViolation<UsersServiceUser>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "12345678",
            "1234567890123456",
            "abc123def"
        })
        @DisplayName("Invalid phone formats")
        void invalidPhoneFormatsShouldFail(String phone) {
            // given
            UsersServiceUser user = createValidUsersServiceUser();
            user.setPhone(phone);

            // when
            Set<ConstraintViolation<UsersServiceUser>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
        }

        @ParameterizedTest
        @ValueSource(strings = {"notanemail", "@invalid.com"})
        @DisplayName("Invalid email formats")
        void invalidEmailFormatsShouldFail(String email) {
            // given
            UsersServiceUser user = createValidUsersServiceUser();
            user.setEmail(email);

            // when
            Set<ConstraintViolation<UsersServiceUser>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("Id should not be null")
        void idShouldNotBeNull() {
            // given
            UsersServiceUser user = createValidUsersServiceUser();
            user.setId(null);

            // when
            Set<ConstraintViolation<UsersServiceUser>> violations = validator.validate(user);

            // then
            assertFalse(violations.isEmpty(), "Validator should find violations when ID is null");
            boolean hasIdViolation = violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("id"));
            assertTrue(hasIdViolation, "Violation for 'id' field is missing");
        }
    }
}
