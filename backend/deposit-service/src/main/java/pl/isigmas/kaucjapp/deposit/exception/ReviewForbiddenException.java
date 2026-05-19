package pl.isigmas.kaucjapp.deposit.exception;

import org.springframework.http.HttpStatus;

public class ReviewForbiddenException extends KaucjappException {
    public ReviewForbiddenException(String message) {
        super(message, "DEP_007", HttpStatus.FORBIDDEN);
    }
}
