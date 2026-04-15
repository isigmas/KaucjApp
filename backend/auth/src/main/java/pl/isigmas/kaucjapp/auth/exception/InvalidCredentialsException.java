package pl.isigmas.kaucjapp.auth.exception;

import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends AuthBaseException {
    public InvalidCredentialsException() {
        super("Invalid credentials", "AU_001", HttpStatus.BAD_REQUEST);
    }
}
