package pl.isigmas.kaucjapp.users.advice;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.dao.DataIntegrityViolationException;
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

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(EntityNotFoundException ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode("DB_NOT_FOUND")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
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

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, Object> validationErrors = collectBindingErrors(ex);
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode("VALIDATION_ERR")
                .message("Validation failed")
                .path(request.getRequestURI())
                .validationErrors(validationErrors.isEmpty() ? null : validationErrors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiError> handleBind(BindException ex, HttpServletRequest request) {
        Map<String, Object> validationErrors = new LinkedHashMap<>();
        for (FieldError err : ex.getBindingResult().getFieldErrors()) {
            validationErrors.put(err.getField(), err.getDefaultMessage() == null ? "Invalid value" : err.getDefaultMessage());
        }
        ex.getBindingResult().getGlobalErrors().forEach(err -> {
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

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        if (isUsersUsernameOrEmailUniqueViolation(ex)) {
            ApiError error = ApiError.builder()
                    .timestamp(LocalDateTime.now())
                    .errorCode("USER_005")
                    .message("User already exists")
                    .path(request.getRequestURI())
                    .build();
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        if (isNumericOrValueOutOfRange(ex)) {
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("database", "A value could not be stored in the database. Check numeric ranges and field lengths.");
            ApiError error = ApiError.builder()
                    .timestamp(LocalDateTime.now())
                    .errorCode("VALIDATION_ERR")
                    .message("Invalid or out-of-range value")
                    .path(request.getRequestURI())
                    .validationErrors(details)
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .errorCode("INTERNAL_ERR")
                .message("Unexpected server error")
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

   
    private static boolean isUsersUsernameOrEmailUniqueViolation(DataIntegrityViolationException ex) {
        Throwable mostSpecific = NestedExceptionUtils.getMostSpecificCause(ex);
        String message = mostSpecific == null ? null : mostSpecific.getMessage();
        if (message == null) {
            return false;
        }
        String m = message.toLowerCase();

        boolean looksLikeUniqueViolation = m.contains("duplicate key") || m.contains("unique constraint") || m.contains("23505");
        if (!looksLikeUniqueViolation) {
            return false;
        }

        return m.contains("users") && (m.contains("username") || m.contains("email"));
    }

    private static boolean isNumericOrValueOutOfRange(DataIntegrityViolationException ex) {
        Throwable t = NestedExceptionUtils.getMostSpecificCause(ex);
        if (t == null) {
            return false;
        }
        String m = t.getMessage();
        if (m == null) {
            return false;
        }
        String lower = m.toLowerCase();
        return lower.contains("22003")
                || lower.contains("22008")
                || lower.contains("numeric value out of range")
                || lower.contains("out of range for type")
                || lower.contains("value too long")
                || lower.contains("22001");
    }

    private static Map<String, Object> collectBindingErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> validationErrors = new LinkedHashMap<>();
        for (FieldError err : ex.getBindingResult().getFieldErrors()) {
            validationErrors.put(err.getField(), err.getDefaultMessage() == null ? "Invalid value" : err.getDefaultMessage());
        }
        ex.getBindingResult().getGlobalErrors().forEach(err -> {
            String key = "_global." + err.getCode();
            String msg = err.getDefaultMessage() == null
                    ? "Invalid value"
                    : err.getDefaultMessage();
            validationErrors.putIfAbsent(key, msg);
        });
        return validationErrors;
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
