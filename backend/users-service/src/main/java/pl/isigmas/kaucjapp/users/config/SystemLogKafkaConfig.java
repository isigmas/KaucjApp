package pl.isigmas.kaucjapp.users.config;

import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.boot.kafka.autoconfigure.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import pl.isigmas.kaucjapp.common.kafka.KafkaProducerConfigSupport;
import pl.isigmas.kaucjapp.common.logger.SystemLog;

import java.util.Map;

/**
 * Kafka producer for {@link pl.isigmas.kaucjapp.common.logger.Logger} (topic {@code system-logs}).
 * Default {@code @Primary} template uses String serializers for domain events.
 */
@Configuration
@Profile("!test")
public class SystemLogKafkaConfig {

    private final Map<String, Object> baseProducerProperties;

    public SystemLogKafkaConfig(KafkaProperties kafkaProperties) {
        this.baseProducerProperties = kafkaProperties.buildProducerProperties();
    }

    @Bean
    @Primary
    public ProducerFactory<String, String> stringKafkaProducerFactory() {
        return new DefaultKafkaProducerFactory<>(
                KafkaProducerConfigSupport.producerProps(
                        baseProducerProperties,
                        StringSerializer.class,
                        StringSerializer.class
                )
        );
    }

    @Bean
    @Primary
    public KafkaTemplate<String, String> kafkaTemplate(ProducerFactory<String, String> stringKafkaProducerFactory) {
        return new KafkaTemplate<>(stringKafkaProducerFactory);
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
