package pl.isigmas.kaucjapp.deposit.config;

import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.boot.kafka.autoconfigure.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import pl.isigmas.kaucjapp.common.kafka.KafkaProducerConfigSupport;
import pl.isigmas.kaucjapp.common.logger.SystemLog;

import java.util.Map;

/**
 * Kafka producer for {@link pl.isigmas.kaucjapp.common.logger.Logger} (topic {@code system-logs}).
 */
@Configuration
@Profile("!test")
public class SystemLogKafkaConfig {

    private final Map<String, Object> baseProducerProperties;

    public SystemLogKafkaConfig(KafkaProperties kafkaProperties) {
        this.baseProducerProperties = kafkaProperties.buildProducerProperties(null);
    }

    @Bean
    public ProducerFactory<String, SystemLog> systemLogProducerFactory() {
        return new DefaultKafkaProducerFactory<>(
                KafkaProducerConfigSupport.producerProps(
                        baseProducerProperties,
                        StringSerializer.class,
                        CustomKafkaJsonSerializer.class
                )
        );
    }

    @Bean
    public KafkaTemplate<String, SystemLog> systemLogKafkaTemplate(
            ProducerFactory<String, SystemLog> systemLogProducerFactory) {
        return new KafkaTemplate<>(systemLogProducerFactory);
    }
}
