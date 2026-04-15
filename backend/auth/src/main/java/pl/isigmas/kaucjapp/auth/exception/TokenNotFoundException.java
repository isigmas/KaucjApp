package pl.isigmas.kaucjapp.auth.exception;

import org.springframework.http.HttpStatus;

public class TokenNotFoundException extends AuthBaseException {
    public TokenNotFoundException() {
        super("Token not found", "AU_002", HttpStatus.BAD_REQUEST);
    }
}
