package pl.isigmas.kaucjapp.users.exception;

import org.springframework.http.HttpStatus;

public class SelfRatingForbiddenException extends KaucjappException {
    public SelfRatingForbiddenException() {
        super("Cannot rate yourself", "USER_004", HttpStatus.FORBIDDEN);
    }
}

