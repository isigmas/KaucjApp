package pl.isigmas.kaucjapp.gateway.exception;

import org.springframework.http.HttpStatus;

public class DownstreamUnavailableException extends GatewayBaseException {
    public DownstreamUnavailableException(String targetUrl) {
        super(HttpStatus.SERVICE_UNAVAILABLE, "GW_DOWNSTREAM_UNAVAILABLE", "Downstream service is not available: " + targetUrl);
    }
}
