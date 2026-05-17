package pl.isigmas.kaucjapp.common.logger;

public record SystemLog(
        String serviceName,
        LogLevel level,
        String message,
        long timestamp
) {}
