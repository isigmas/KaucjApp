package pl.isigmas.kaucjapp.auth.validation;

import jakarta.annotation.PostConstruct;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ProfanityValidator implements ConstraintValidator<CleanUsername, String> {

    @Value("${validation.profanity.words}")
    private String profanityRaw;

    @Value("${validation.profanity.reserved}")
    private String reservedRaw;

    private List<String> profanity;
    private Set<String> reserved;

    @PostConstruct
    public void init() {
        profanity = Arrays.asList(profanityRaw.split(","));
        reserved = new HashSet<>(Arrays.asList(reservedRaw.split(",")));
    }

    private static final Map<Character, Character> LEET = Map.of(
            '0', 'o',
            '1', 'i',
            '3', 'e',
            '4', 'a',
            '5', 's',
            '8', 'b'
    );

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) return true;

        String lower = value.toLowerCase();
        String normalized = normalizeLeet(lower);

        if (reserved.contains(normalized)) return false;

        if (profanity.stream().anyMatch(normalized::contains)) return false;

        return true;
    }

    private String normalizeLeet(String input) {
        StringBuilder sb = new StringBuilder(input.length());
        for (char c : input.toCharArray()) {
            sb.append(LEET.getOrDefault(c, c));
        }
        return sb.toString();
    }
}