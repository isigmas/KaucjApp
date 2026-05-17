package pl.isigmas.kaucjapp.common.logger;

import org.springframework.kafka.core.KafkaTemplate;

public class Logger {

    private final KafkaTemplate<String, SystemLog> kafkaTemplate;
    private final String serviceName;

    public Logger(KafkaTemplate<String, SystemLog> kafkaTemplate, String serviceName) {
        this.kafkaTemplate = kafkaTemplate;
        this.serviceName = serviceName;
    }

    public void info(String message) {
        send(message, LogLevel.INFO);
    }

    public void important(String message) {
        send(message, LogLevel.IMPORTANT);
    }

    public void warn(String message) {
        send(message, LogLevel.WARN);
    }

    public void error(String message) {
        send(message, LogLevel.ERROR);
    }

    private void send(String message, LogLevel level) {
        kafkaTemplate.send("system-logs", new SystemLog(
                serviceName,
                level,
                message,
                System.currentTimeMillis()
        ));
    }
}
