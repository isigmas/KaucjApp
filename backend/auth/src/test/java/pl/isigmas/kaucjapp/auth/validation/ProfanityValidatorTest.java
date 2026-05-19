package pl.isigmas.kaucjapp.auth.validation;

import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import pl.isigmas.kaucjapp.auth.TestcontainersConfiguration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

@DisplayName("ProfanityValidator")
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class ProfanityValidatorTest {

    @Autowired
    private ProfanityValidator validator;

    private ConstraintValidatorContext context;

    @BeforeEach
    void setUp() {
        // initialize() woła Hibernate przy walidacji przez API — tu wołamy ręcznie
        validator.initialize(mock(CleanUsername.class));
        context = mock(ConstraintValidatorContext.class);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "\t"})
    @DisplayName("null/blank delegated to @NotBlank — validator passes")
    void nullOrBlankIsValid(String value) {
        assertTrue(validator.isValid(value, context));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "validuser",
            "janek123",
            "student99",
            "kowalski",
            "user2024"
    })
    @DisplayName("clean usernames pass")
    void cleanUsernamesPass(String username) {
        assertTrue(validator.isValid(username, context));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "admin",
            "Admin",
            "ADMIN",
            "moderator",
            "kaucjapp",
            "support",
            "root",
            "guest"
    })
    @DisplayName("reserved names blocked (exact match, case-insensitive)")
    void reservedNamesBlocked(String username) {
        assertFalse(validator.isValid(username, context));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "4dm1n",
            "t3st",
            "m0derator",
            "k4ucjapp"
    })
    @DisplayName("leet-speak reserved names blocked after normalization")
    void leetReservedNamesBlocked(String username) {
        assertFalse(validator.isValid(username, context));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "chuj123",
            "kurwator",
            "jebacz",
            "debilix",
            "pierdolnik",
            "cwel123"
    })
    @DisplayName("profanity substrings blocked")
    void profanitySubstringsBlocked(String username) {
        assertFalse(validator.isValid(username, context));
    }

    @Test
    @DisplayName("leet profanity blocked after normalization")
    void leetProfanityBlocked() {
        assertFalse(validator.isValid("j3bany", context)); // 3 -> e => jebany
    }
}
