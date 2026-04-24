package pl.isigmas.kaucjapp.gateway.exception;

import org.springframework.http.HttpStatus;

public class InvalidRouteConfigurationException extends GatewayBaseException {
    public InvalidRouteConfigurationException(String message) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, "GW_ROUTE_CONFIG_INVALID", message);
    }
}

