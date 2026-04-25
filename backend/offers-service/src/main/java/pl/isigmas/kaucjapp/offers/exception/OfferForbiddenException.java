package pl.isigmas.kaucjapp.offers.exception;

import org.springframework.http.HttpStatus;

public class OfferForbiddenException extends KaucjappException {
    public OfferForbiddenException(String message) {
        super(message, "OFFER_007", HttpStatus.FORBIDDEN);
    }
}

