package pl.isigmas.kaucjapp.gateway.advice;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.isigmas.kaucjapp.gateway.dto.error.ApiError;
import pl.isigmas.kaucjapp.gateway.exception.GatewayBaseException;

import java.time.Instant;

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
        ApiError error = ApiError.builder()
                .timestamp(Instant.now())
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(ex.getStatus()).body(error);
    }


    /**
     * Fallback handler for all unexpected exceptions that bypass specific domain handlers.
     * Prevents stack trace leakage by returning a generic 500 Internal Server Error.
     *
     * @param ex      the unhandled exception
     * @param request the current HTTP request
     * @return a structured {@link ApiError} with a generic internal error message
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(Instant.now())
                .errorCode("INTERNAL_ERR")
                .message("Unexpected server error")
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(Instant.now())
                .errorCode("MALFORMED_JSON")
                .message("Invalid request body")
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ApiError> handleMissingHeader(MissingRequestHeaderException ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(Instant.now())
                .errorCode("BAD_REQUEST")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}

