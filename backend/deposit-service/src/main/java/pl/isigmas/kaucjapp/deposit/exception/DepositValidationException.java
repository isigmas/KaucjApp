package pl.isigmas.kaucjapp.deposit.exception;

import org.springframework.http.HttpStatus;

public class DepositValidationException extends KaucjappException {
    public DepositValidationException(String message) {
        super(message, "DEP_003", HttpStatus.BAD_REQUEST);
    }
}

