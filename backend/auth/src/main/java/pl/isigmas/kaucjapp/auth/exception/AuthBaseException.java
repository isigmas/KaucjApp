package pl.isigmas.kaucjapp.auth.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class AuthBaseException extends RuntimeException {
    private final String errorCode;
    private final HttpStatus status;

    protected AuthBaseException(String message, String errorCode, HttpStatus status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }
}
