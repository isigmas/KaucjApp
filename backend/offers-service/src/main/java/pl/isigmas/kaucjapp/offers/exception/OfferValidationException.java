package pl.isigmas.kaucjapp.offers.exception;

import org.springframework.http.HttpStatus;

public class OfferValidationException extends KaucjappException {
    public OfferValidationException(String message) {
        super(message, "OFFER_003", HttpStatus.BAD_REQUEST);
    }
}

