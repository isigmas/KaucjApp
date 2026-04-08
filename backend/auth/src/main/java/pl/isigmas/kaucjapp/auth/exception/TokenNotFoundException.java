package pl.isigmas.kaucjapp.auth.exception;

public class TokenNotFoundException extends AuthBaseException {
    public TokenNotFoundException() {
        super("Token not found");
    }
}
