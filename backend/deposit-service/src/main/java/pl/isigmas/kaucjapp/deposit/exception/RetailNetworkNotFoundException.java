package pl.isigmas.kaucjapp.deposit.exception;

import org.springframework.http.HttpStatus;

public class RetailNetworkNotFoundException extends KaucjappException {
    public RetailNetworkNotFoundException(String name) {
        super("Retail network not found: " + name, "DEP_002", HttpStatus.NOT_FOUND);
    }
}

