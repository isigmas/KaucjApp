package pl.isigmas.kaucjapp.users.exception;

import org.springframework.http.HttpStatus;

public class RatingNotFoundException extends KaucjappException {
    public RatingNotFoundException(Long userId) {
        super("Reviews not found for user ID: " + userId, "USER_002", HttpStatus.NOT_FOUND);
    }
}

