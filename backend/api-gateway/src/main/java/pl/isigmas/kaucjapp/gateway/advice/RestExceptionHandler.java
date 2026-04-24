package pl.isigmas.kaucjapp.gateway.advice;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
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
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(ex.getStatus()).body(error);
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode("INTERNAL_ERR")
                .message("Unexpected server error")
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

