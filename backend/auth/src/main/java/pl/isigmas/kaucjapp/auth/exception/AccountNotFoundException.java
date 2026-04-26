package pl.isigmas.kaucjapp.auth.exception;

import org.springframework.http.HttpStatus;

public class AccountNotFoundException extends AuthBaseException {
    public AccountNotFoundException(Long id) {
        super("Account with ID: '" + id + "' not found", "AU_008", HttpStatus.NOT_FOUND);
    }

    public AccountNotFoundException(String email) {
        super("Account with email: '" + email + "' not found", "AU_008", HttpStatus.NOT_FOUND);
    }
}
