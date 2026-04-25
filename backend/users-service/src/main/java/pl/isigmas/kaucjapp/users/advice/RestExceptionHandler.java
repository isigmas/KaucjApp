package pl.isigmas.kaucjapp.users.advice;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.isigmas.kaucjapp.users.DTO.error.ApiError;
import pl.isigmas.kaucjapp.users.exception.KaucjappException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(KaucjappException.class)
    public ResponseEntity<ApiError> handleKaucjappException(KaucjappException ex, HttpServletRequest request) {
        HttpStatus status = ex.getStatus();
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleBadRequest(IllegalArgumentException ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode("BAD_REQUEST")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode("MALFORMED_JSON")
                .message("Invalid JSON or incompatible field types")
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public ResponseEntity<ApiError> handleValidation(Exception ex, HttpServletRequest request) {
        Map<String, Object> validationErrors = new LinkedHashMap<>();

        java.util.List<FieldError> fieldErrors;
        java.util.List<org.springframework.validation.ObjectError> globalErrors;

        if (ex instanceof MethodArgumentNotValidException manv) {
            fieldErrors = manv.getBindingResult().getFieldErrors();
            globalErrors = manv.getBindingResult().getGlobalErrors();
        } else {
            BindException bex = (BindException) ex;
            fieldErrors = bex.getBindingResult().getFieldErrors();
            globalErrors = bex.getBindingResult().getGlobalErrors();
        }

        for (FieldError err : fieldErrors) {
            validationErrors.put(err.getField(), err.getDefaultMessage() == null ? "Invalid value" : err.getDefaultMessage());
        }
        globalErrors.forEach(err -> {
            String key = "_global." + err.getCode();
            String msg = err.getDefaultMessage() == null ? "Invalid value" : err.getDefaultMessage();
            validationErrors.putIfAbsent(key, msg);
        });

        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode("VALIDATION_ERR")
                .message("Validation failed")
                .path(request.getRequestURI())
                .validationErrors(validationErrors.isEmpty() ? null : validationErrors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, Object> validationErrors = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        v -> v.getPropertyPath() == null ? "value" : v.getPropertyPath().toString(),
                        v -> v.getMessage() == null ? "Invalid value" : v.getMessage(),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode("VALIDATION_ERR")
                .message("Validation failed")
                .path(request.getRequestURI())
                .validationErrors(validationErrors.isEmpty() ? null : validationErrors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler({MissingRequestHeaderException.class, MissingServletRequestParameterException.class})
    public ResponseEntity<ApiError> handleMissingInput(Exception ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode("BAD_REQUEST")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiError> handleForbidden(SecurityException ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode("SECURITY_FORBIDDEN")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleConflict(IllegalStateException ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode("STATE_CONFLICT")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
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