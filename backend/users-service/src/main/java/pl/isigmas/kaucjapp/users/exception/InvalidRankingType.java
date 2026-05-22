package pl.isigmas.kaucjapp.users.exception;

import org.springframework.http.HttpStatus;

public class InvalidRankingType extends KaucjappException {
    public InvalidRankingType(String message) {
        super(message, "USER_011", HttpStatus.BAD_REQUEST);
    }
}