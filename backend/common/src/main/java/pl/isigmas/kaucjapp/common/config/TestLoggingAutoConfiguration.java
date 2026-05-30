package pl.isigmas.kaucjapp.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import pl.isigmas.kaucjapp.common.logger.Logger;

/**
 * In-memory logger for tests — no Kafka producer threads.
 */
@Configuration
@Profile("test")
public class TestLoggingAutoConfiguration {

    @Bean
    public Logger logger(@Value("${spring.application.name:unknown-service}") String serviceName) {
        return new Logger(null, serviceName);
    }
}
