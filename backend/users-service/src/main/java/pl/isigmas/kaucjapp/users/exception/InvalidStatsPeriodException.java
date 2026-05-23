package pl.isigmas.kaucjapp.users.exception;

import org.springframework.http.HttpStatus;

public class InvalidStatsPeriodException extends KaucjappException {
    public InvalidStatsPeriodException(String message) {
        super(message, "USER_010", HttpStatus.BAD_REQUEST);
    }
}