package pl.isigmas.kaucjapp.auth.exception;

import org.springframework.http.HttpStatus;
import pl.isigmas.kaucjapp.auth.entity.ActivationToken;
import pl.isigmas.kaucjapp.auth.entity.PasswordToken;
import pl.isigmas.kaucjapp.auth.entity.RefreshToken;

public class ExpiredTokenException extends AuthBaseException {
    public ExpiredTokenException(RefreshToken token) {
        super("Token expired at: " + token.getExpirationDate(), "AU_003", HttpStatus.UNAUTHORIZED);
    }

    public ExpiredTokenException(ActivationToken token) {
        super("Token expired at: " + token.getExpirationDate(), "AU_003", HttpStatus.UNAUTHORIZED);
    }

    public ExpiredTokenException(PasswordToken token) {
        super("Token expired at: " + token.getExpirationDate(), "AU_003", HttpStatus.UNAUTHORIZED);
    }
}
