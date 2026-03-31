package pl.isigmas.kaucjapp.gateway.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.ResourceAccessException;

import java.util.Map;

/**
 * Globalny handler wyjatkow dla API Gateway.
 * Dzieki niemu bledy sa zwracane bezposrednio bez przekierowania na /error,
 * co pozwala na poprawna obsluge security (bez koniecznosci dodawania /error do permitAll).
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<Map<String, Object>> handleResourceAccessException(ResourceAccessException ex) {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "error", "Service Unavailable",
                        "message", "Downstream service is not available",
                        "status", 503
                ));
    }
}
