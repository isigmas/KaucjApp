package pl.isigmas.kaucjapp.offers.exception;

import org.springframework.http.HttpStatus;

public class OfferAlreadyClaimedException extends KaucjappException {
    public OfferAlreadyClaimedException() {
        super("Offer already claimed", "OFFER_005", HttpStatus.CONFLICT);
    }

    public OfferAlreadyClaimedException(String message) {
        super(message, "OFFER_006", HttpStatus.CONFLICT);
    }
}

