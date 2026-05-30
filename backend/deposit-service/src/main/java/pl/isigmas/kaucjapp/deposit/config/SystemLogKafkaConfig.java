package pl.isigmas.kaucjapp.deposit.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import pl.isigmas.kaucjapp.common.logger.SystemLog;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka producer for {@link pl.isigmas.kaucjapp.common.logger.Logger} (topic {@code system-logs}).
 */
@Configuration
public class SystemLogKafkaConfig {

    @Bean
    public ProducerFactory<String, SystemLog> systemLogProducerFactory(
            @Value("${spring.kafka.bootstrap-servers}") String bootstrapServers) {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, CustomKafkaJsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, SystemLog> systemLogKafkaTemplate(
            ProducerFactory<String, SystemLog> systemLogProducerFactory) {
        return new KafkaTemplate<>(systemLogProducerFactory);
    }
}
