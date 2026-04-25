package pl.isigmas.kaucjapp.gateway.exception;

import org.springframework.http.HttpStatus;

public class DownstreamTimeoutException extends GatewayBaseException {
    public DownstreamTimeoutException(String targetUrl) {
        super(HttpStatus.GATEWAY_TIMEOUT, "GW_001", "Downstream service timed out: " + targetUrl);
    }
}

