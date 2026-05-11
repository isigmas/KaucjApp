package pl.isigmas.kaucjapp.auth.config;

import org.springframework.kafka.support.serializer.JsonSerializer;

public class CustomKafkaJsonSerializer<T> extends JsonSerializer<T> {

    public CustomKafkaJsonSerializer() {
        super();
        this.objectMapper.findAndRegisterModules();
    }
}