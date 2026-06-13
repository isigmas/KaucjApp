package pl.isigmas.kaucjapp.common.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import org.springframework.kafka.support.JacksonUtils;
import org.springframework.kafka.support.serializer.JsonSerializer;

/**
 * Kafka JSON serializer with snake_case naming. The naming strategy must be applied before
 * {@link JsonSerializer} caches its {@link com.fasterxml.jackson.databind.ObjectWriter}.
 */
public class SnakeCaseKafkaJsonSerializer<T> extends JsonSerializer<T> {

    public SnakeCaseKafkaJsonSerializer() {
        super(createMapper());
    }

    private static ObjectMapper createMapper() {
        ObjectMapper mapper = JacksonUtils.enhancedObjectMapper();
        mapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
        return mapper.findAndRegisterModules();
    }
}
