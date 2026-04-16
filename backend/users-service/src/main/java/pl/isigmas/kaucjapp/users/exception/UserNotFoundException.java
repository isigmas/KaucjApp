package pl.isigmas.kaucjapp.users.exception;

import org.springframework.http.HttpStatus;

public class UserNotFoundException extends KaucjappException {
    public UserNotFoundException(Long userId) {
        super("User not found with ID: " + userId, "USER_001", HttpStatus.NOT_FOUND);
    }
}

