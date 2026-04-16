package pl.isigmas.kaucjapp.users.exception;

import org.springframework.http.HttpStatus;

public class InvalidInternalSecretException extends KaucjappException {
    public InvalidInternalSecretException() {
        super("X-Internal-Secret missing or invalid", "USER_003", HttpStatus.FORBIDDEN);
    }
}

