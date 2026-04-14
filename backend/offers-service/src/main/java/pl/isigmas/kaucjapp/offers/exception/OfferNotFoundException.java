package pl.isigmas.kaucjapp.offers.exception;

import org.springframework.http.HttpStatus;

public class OfferNotFoundException extends KaucjappException{

    public OfferNotFoundException() {
        super("offer not found", "OFFER_001", HttpStatus.NOT_FOUND);
    }

    public OfferNotFoundException(Long offerId) {
        super(String.format("offer not found with ID: %d", offerId), "OFFER_001", HttpStatus.NOT_FOUND);
    }

}
