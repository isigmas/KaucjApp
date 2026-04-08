package pl.isigmas.kaucjapp.auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.auth.exception.InvalidCredentialsException;

@Component
@RequiredArgsConstructor
public class Encoder {

    private final PasswordEncoder passwordEncoder;

    @Value("${PASSWORD_SALT}")
    private String secret;

    private String withSalt(String password) {
        return password + secret;
    }

    public String hashPassword(String rawPassword) {
        checkPassword(rawPassword);

        String passwordWithSalt = withSalt(rawPassword);
        return passwordEncoder.encode(passwordWithSalt);
    }

    public boolean verifyPassword(String rawPassword, String hashedPassword) {
        checkPassword(rawPassword);
        checkPassword(hashedPassword);

        String passwordWithSalt = withSalt(rawPassword);
        return passwordEncoder.matches(passwordWithSalt, hashedPassword);
    }

    private void checkPassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new InvalidCredentialsException();
        }
    }
}
