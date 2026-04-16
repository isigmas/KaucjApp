package pl.isigmas.kaucjapp.offers.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class KaucjappException extends RuntimeException {
    private final String errorCode;
    private final HttpStatus status;

    protected KaucjappException(String message, String errorCode) {
        this(message, errorCode, HttpStatus.BAD_REQUEST);
    }

    public KaucjappException(String message, String errorCode, HttpStatus status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }
}