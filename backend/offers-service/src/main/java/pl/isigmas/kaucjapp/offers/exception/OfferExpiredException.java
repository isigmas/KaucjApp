package pl.isigmas.kaucjapp.offers.exception;

import org.springframework.http.HttpStatus;

public class OfferExpiredException extends KaucjappException {
    public OfferExpiredException() {
        super("Offer has expired", "OFFER_004", HttpStatus.BAD_REQUEST);
    }

    public OfferExpiredException(String message) {
        super(message, "OFFER_004", HttpStatus.BAD_REQUEST);
    }
}

