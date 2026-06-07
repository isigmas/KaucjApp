package pl.isigmas.kaucjapp.common.kafka;

import org.apache.kafka.clients.producer.ProducerConfig;

import java.util.HashMap;
import java.util.Map;

/**
 * Builds producer config maps for manually declared {@link org.springframework.kafka.core.ProducerFactory}
 * beans so they inherit the same settings as Spring Boot auto-configuration (including Event Hubs SASL_SSL).
 */
public final class KafkaProducerConfigSupport {

    private KafkaProducerConfigSupport() {
    }

    public static Map<String, Object> producerProps(
            Map<String, Object> baseProducerProperties,
            Class<?> keySerializer,
            Class<?> valueSerializer
    ) {
        Map<String, Object> props = new HashMap<>(baseProducerProperties);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, keySerializer);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, valueSerializer);
        return props;
    }
}
