package pl.isigmas.kaucjapp.gateway.exception;

import org.springframework.http.HttpStatus;

public abstract class GatewayBaseException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    protected GatewayBaseException(HttpStatus status, String errorCode, String message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }
}

