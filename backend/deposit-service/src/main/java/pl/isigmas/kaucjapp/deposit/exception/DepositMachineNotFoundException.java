package pl.isigmas.kaucjapp.deposit.exception;

import org.springframework.http.HttpStatus;

public class DepositMachineNotFoundException extends KaucjappException {
    public DepositMachineNotFoundException(Long id) {
        super("Machine with such id not found: " + id, "DEP_001", HttpStatus.NOT_FOUND);
    }
}

