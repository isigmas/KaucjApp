package pl.isigmas.kaucjapp.offers.exception;

import org.springframework.http.HttpStatus;

public class OfferInvalidArgumentException extends KaucjappException{

    public OfferInvalidArgumentException() {
        super("Invalid argument in offer", "OFFER_002", HttpStatus.BAD_REQUEST);
    }

}
