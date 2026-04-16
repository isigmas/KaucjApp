package pl.isigmas.kaucjapp.auth.exception;

import org.springframework.http.HttpStatus;

public class UsedTokenException extends AuthBaseException {
    public UsedTokenException() {
        super("Token was already used", "AU_005", HttpStatus.CONFLICT);
    }
}
