package pl.isigmas.kaucjapp.auth.exception;

public class InvalidCredentialsException extends AuthBaseException {
    public InvalidCredentialsException() {
        super("Invalid credentials");
    }
}
