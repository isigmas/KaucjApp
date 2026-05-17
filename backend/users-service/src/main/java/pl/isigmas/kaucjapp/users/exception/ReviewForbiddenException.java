package pl.isigmas.kaucjapp.users.exception;

import org.springframework.http.HttpStatus;

public class ReviewForbiddenException extends KaucjappException {
    public ReviewForbiddenException(String message) {
        super(message, "USER_007", HttpStatus.FORBIDDEN);
    }
}

