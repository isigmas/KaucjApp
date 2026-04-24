package pl.isigmas.kaucjapp.gateway.exception;

import org.springframework.http.HttpStatus;

public class HeaderInjectionException extends GatewayBaseException {
    public HeaderInjectionException(String path, String reason) {
        super(HttpStatus.BAD_REQUEST, "GW_HEADER_INJECTION", "Cannot inject gateway headers: " + reason);
    }
}
