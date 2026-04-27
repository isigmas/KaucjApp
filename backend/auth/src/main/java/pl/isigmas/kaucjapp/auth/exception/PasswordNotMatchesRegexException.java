package pl.isigmas.kaucjapp.auth.exception;

import org.springframework.http.HttpStatus;

public class PasswordNotMatchesRegexException extends AuthBaseException {
    public PasswordNotMatchesRegexException(String message) {
        super(message,"AU_009", HttpStatus.BAD_REQUEST);
    }
}
