package pl.isigmas.kaucjapp.auth.exception;

import org.springframework.http.HttpStatus;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;

public class AccountNotActiveException extends AuthBaseException {
    public AccountNotActiveException(AccountStatus status) {
        super("Account status: " + status, "AU_004", HttpStatus.BAD_REQUEST);
    }
}
