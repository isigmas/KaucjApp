package pl.isigmas.kaucjapp.users.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaJacksonConfig {

    /**
     * Dedicated mapper for Kafka payloads. Must not use SNAKE_CASE globally — auth publishes
     * mixed naming (camelCase fields + explicit @JsonProperty names like user_id).
     */
    @Bean
    @Qualifier("kafkaObjectMapper")
    public ObjectMapper kafkaObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        return mapper;
    }
}
