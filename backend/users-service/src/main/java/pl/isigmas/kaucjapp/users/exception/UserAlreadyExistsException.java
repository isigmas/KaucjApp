package pl.isigmas.kaucjapp.users.exception;

import org.springframework.http.HttpStatus;

public class UserAlreadyExistsException extends KaucjappException {
    public UserAlreadyExistsException(String message) {
        super(message, "USER_005", HttpStatus.CONFLICT);
    }

    public static UserAlreadyExistsException forEmail(String email) {
        return new UserAlreadyExistsException("User with email already exists: " + email);
    }

    public static UserAlreadyExistsException forUsername(String username) {
        return new UserAlreadyExistsException("User with username already exists: " + username);
    }
}

