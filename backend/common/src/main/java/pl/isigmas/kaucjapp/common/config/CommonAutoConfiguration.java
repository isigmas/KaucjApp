package pl.isigmas.kaucjapp.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.common.logger.SystemLog;

@Configuration
public class CommonAutoConfiguration {

    @Bean
    public Logger logger(
            KafkaTemplate<String, SystemLog> kafkaTemplate,
            @Value("${spring.application.name:unknown-service}") String serviceName
    ) {
        return new Logger(kafkaTemplate, serviceName);
    }
}
