package pl.isigmas.kaucjapp.auth.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.List;
import java.util.Map;
import java.util.Set;

public class ProfanityValidator implements ConstraintValidator<CleanUsername, String> {

    // Wulgaryzmy — substring match po normalizacji
    private static final List<String> PROFANITY = List.of(
            "kutas", "chuj", "huj", "kurw", "jeb", "cip", "cwel", "debil",
            "pierdol", "pizd", "dziwk", "szmat", "suka", "pedal", "zjeb",
            "rucha", "srac", "zajeb"
    );

    // Nazwy zastrzeżone — exact match
    private static final Set<String> RESERVED = Set.of(
            "admin", "administrator", "support", "moderator", "mod",
            "system", "root", "pomoc", "kaucjapp", "test", "bot",
            "guest", "superuser"
    );

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

        if (RESERVED.contains(normalized)) return false;

        if (PROFANITY.stream().anyMatch(normalized::contains)) return false;

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