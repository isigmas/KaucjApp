package pl.isigmas.kaucjapp.auth.exception;

import org.springframework.http.HttpStatus;

public class RevokedTokenException extends AuthBaseException {
    public RevokedTokenException() {
        super("Token was revoked", "AU_006", HttpStatus.BAD_REQUEST);
    }
}
