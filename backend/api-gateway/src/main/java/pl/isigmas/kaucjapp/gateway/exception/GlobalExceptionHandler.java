package pl.isigmas.kaucjapp.gateway.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.ResourceAccessException;

import java.util.Map;

/**
 * Global exception handler for the API Gateway.
 *
 * <p>This class intercepts exceptions thrown by the application and transforms them
 * into standardized HTTP responses. By centralizing error handling, it ensures
 * a consistent API contract and prevents leaking internal system details.</p>
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles {@link ResourceAccessException} triggered when a downstream service
     * is unreachable or a connection timeout occurs.
     *
     * <p>The method maps the exception to an HTTP 503 Service Unavailable status,
     * providing the client with a clear indication that the gateway cannot
     * fulfill the request due to external service unavailability.</p>
     *
     * @param ex the caught {@link ResourceAccessException}
     * @return a {@link ResponseEntity} containing a structured error map:
     * <ul>
     * <li>{@code error}: A short error identifier.</li>
     * <li>{@code message}: A human-readable description of the issue.</li>
     * <li>{@code status}: The numerical HTTP status code.</li>
     * </ul>
     */
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
