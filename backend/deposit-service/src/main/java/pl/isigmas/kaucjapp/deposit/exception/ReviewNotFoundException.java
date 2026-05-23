package pl.isigmas.kaucjapp.deposit.exception;

import org.springframework.http.HttpStatus;

public class ReviewNotFoundException extends KaucjappException {
    public ReviewNotFoundException(Long reviewId) {
        super("Review not found with ID: " + reviewId, "DEP_006", HttpStatus.NOT_FOUND);
    }
}
