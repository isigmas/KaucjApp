package pl.isigmas.kaucjapp.offers.exception;

import org.springframework.http.HttpStatus;

public class BottleTypeNotFoundException extends KaucjappException {
    public BottleTypeNotFoundException(Long bottleTypeId) {
        super("Bottle type not found with ID: " + bottleTypeId, "BOTTLE_001", HttpStatus.NOT_FOUND);
    }
}

