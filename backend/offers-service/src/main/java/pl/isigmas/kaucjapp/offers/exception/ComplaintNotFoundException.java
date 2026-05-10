package pl.isigmas.kaucjapp.offers.exception;

import org.springframework.http.HttpStatus;

public class ComplaintNotFoundException extends KaucjappException {

    public ComplaintNotFoundException(Long offerId) {
        super(
                String.format("No complaint from this user for offer id: %d", offerId),
                "OFFER_CMP_001",
                HttpStatus.NOT_FOUND);
    }
}
