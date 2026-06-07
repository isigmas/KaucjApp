package pl.isigmas.kaucjapp.common.logger;

import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;

@RegisterReflectionForBinding
public record SystemLog(
        String serviceName,
        LogLevel level,
        String message,
        long timestamp
) {}
