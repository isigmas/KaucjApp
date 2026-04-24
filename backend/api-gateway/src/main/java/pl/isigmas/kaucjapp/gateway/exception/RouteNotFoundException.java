package pl.isigmas.kaucjapp.gateway.exception;

import org.springframework.http.HttpStatus;

public class RouteNotFoundException extends GatewayBaseException {
    public RouteNotFoundException(String path) {
        super(HttpStatus.NOT_FOUND, "GW_005", "No route configured for path: " + path);
    }
}

