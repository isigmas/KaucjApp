package pl.isigmas.kaucjapp.offers.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import pl.isigmas.kaucjapp.common.logger.SystemLog;
import pl.isigmas.kaucjapp.offers.DTO.OfferCompletedEventDTO;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka producers: {@code @Primary} template for domain events (e.g. {@code offers.completed}),
 * separate template for {@link pl.isigmas.kaucjapp.common.logger.Logger} (topic {@code system-logs}).
 */
@Configuration
@Profile("!test")
public class SystemLogKafkaConfig {

    @Bean
    @Primary
    public ProducerFactory<String, OfferCompletedEventDTO> offerEventProducerFactory(
            @Value("${spring.kafka.bootstrap-servers}") String bootstrapServers) {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, CustomKafkaJsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    @Primary
    public KafkaTemplate<String, OfferCompletedEventDTO> kafkaTemplate(
            ProducerFactory<String, OfferCompletedEventDTO> offerEventProducerFactory) {
        return new KafkaTemplate<>(offerEventProducerFactory);
    }

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
