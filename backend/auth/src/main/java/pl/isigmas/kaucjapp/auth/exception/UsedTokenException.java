package pl.isigmas.kaucjapp.auth.exception;

public class UsedTokenException extends AuthBaseException {
    public UsedTokenException() {
        super("Token was already used");
    }
}
