package pl.isigmas.kaucjapp.auth.exception;

import org.springframework.http.HttpStatus;

public class AccountNotFondException extends AuthBaseException {
    public AccountNotFondException(Long id) {
        super("Account with ID: '" + id + "' not found", "AU_008", HttpStatus.NOT_FOUND);
    }
}
