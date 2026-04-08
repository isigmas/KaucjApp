package pl.isigmas.kaucjapp.auth.exception;

public class RevokedTokenException extends AuthBaseException {
    public RevokedTokenException() {
        super("Token was revoked");
    }
}
