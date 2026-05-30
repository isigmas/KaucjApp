package pl.isigmas.kaucjapp.offers.config;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import org.springframework.kafka.support.serializer.JsonSerializer;

public class CustomKafkaJsonSerializer<T> extends JsonSerializer<T> {

    public CustomKafkaJsonSerializer() {
        super();
        this.objectMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
        this.objectMapper.findAndRegisterModules();
    }
}
