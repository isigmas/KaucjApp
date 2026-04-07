package pl.isigmas.kaucjapp.auth.exception;

import pl.isigmas.kaucjapp.auth.entity.RefreshToken;

public class ExpiredTokenException extends AuthBaseException {
    public ExpiredTokenException(RefreshToken token) {
        super("Token expired at: " + token.getExpirationDate());
    }
}
