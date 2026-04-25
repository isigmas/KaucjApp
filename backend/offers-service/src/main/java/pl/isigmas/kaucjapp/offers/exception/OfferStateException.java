package pl.isigmas.kaucjapp.offers.exception;

import org.springframework.http.HttpStatus;

public class OfferStateException extends KaucjappException {
    public OfferStateException(String message) {
        super(message, "OFFER_008", HttpStatus.CONFLICT);
    }
}

