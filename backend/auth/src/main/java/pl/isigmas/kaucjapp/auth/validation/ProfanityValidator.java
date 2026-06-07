package pl.isigmas.kaucjapp.auth.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ProfanityValidator implements ConstraintValidator<CleanUsername, String> {

    private static final Map<Character, Character> LEET = Map.of(
            '0', 'o',
            '1', 'i',
            '3', 'e',
            '4', 'a',
            '5', 's',
            '8', 'b'
    );

    private final Environment environment;

    private List<String> profanity;
    private Set<String> reserved;

    @Override
    public void initialize(CleanUsername annotation) {
        String profanityRaw = environment.getProperty("validation.profanity.words");
        String reservedRaw = environment.getProperty("validation.profanity.reserved");
        if (profanityRaw == null || reservedRaw == null) {
            throw new IllegalStateException(
                    "validation.profanity.words / validation.profanity.reserved must be set in application.properties");
        }
        profanity = Arrays.stream(profanityRaw.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .toList();
        reserved = new HashSet<>(Arrays.stream(reservedRaw.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .toList());
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) return true;

        String normalized = normalizeLeet(value.toLowerCase());

        if (reserved.contains(normalized)) return false;

        return profanity.stream().noneMatch(normalized::contains);
    }

    private String normalizeLeet(String input) {
        StringBuilder sb = new StringBuilder(input.length());
        for (char c : input.toCharArray()) {
            sb.append(LEET.getOrDefault(c, c));
        }
        return sb.toString();
    }
}
