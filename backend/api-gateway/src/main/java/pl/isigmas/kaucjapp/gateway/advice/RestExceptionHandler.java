package pl.isigmas.kaucjapp.gateway.advice;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.isigmas.kaucjapp.gateway.dto.error.ApiError;
import pl.isigmas.kaucjapp.gateway.exception.GatewayBaseException;

import java.time.LocalDateTime;

/**
 * Global exception handler for the API Gateway.
 *
 * <p>This class intercepts exceptions thrown by the application and transforms them
 * into standardized HTTP responses. By centralizing error handling, it ensures
 * a consistent API contract and prevents leaking internal system details.</p>
 */
@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(GatewayBaseException.class)
    public ResponseEntity<ApiError> handleGatewayBaseException(GatewayBaseException ex, HttpServletRequest request) {
        ApiError error = new ApiError(
                LocalDateTime.now(),
                ex.getErrorCode(),
                ex.getMessage(),
                request.getRequestURI(),
                null
        );

        return ResponseEntity.status(ex.getStatus()).body(error);
    }

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
    public ResponseEntity<ApiError> handleResourceAccessException(ResourceAccessException ex, HttpServletRequest request) {
        ApiError error = new ApiError(
                LocalDateTime.now(),
                "GW_DOWNSTREAM_UNAVAILABLE",
                "Downstream service is not available",
                request.getRequestURI(),
                null
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest request) {
        ApiError error = new ApiError(
                LocalDateTime.now(),
                "INTERNAL_ERR",
                "Unexpected server error",
                request.getRequestURI(),
                null
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

