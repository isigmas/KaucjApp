package pl.isigmas.kaucjapp.auth.exception;

import org.springframework.http.HttpStatus;

public class AccountAlreadyExistsException extends AuthBaseException {
    public AccountAlreadyExistsException(String message) {
        super(message, "AU_007", HttpStatus.CONFLICT);
    }
}

