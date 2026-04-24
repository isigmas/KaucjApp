package pl.isigmas.kaucjapp.gateway.dto.error;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        LocalDateTime timestamp,
        String errorCode,
        String message,
        String path,
        Map<String, Object> validationErrors
) {
}

