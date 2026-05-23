package pl.isigmas.kaucjapp.deposit.exception;

import org.springframework.http.HttpStatus;

public class RatingNotFoundException extends KaucjappException {
    public RatingNotFoundException(Long id) {
        super("Rating not found for deposit machine " + id, "DEP_008", HttpStatus.NOT_FOUND);
    }
}

