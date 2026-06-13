package pl.isigmas.kaucjapp.notification.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.support.JacksonUtils;
import org.springframework.kafka.support.converter.JsonMessageConverter;
import org.springframework.kafka.support.converter.RecordMessageConverter;

@Configuration
public class KafkaConsumerConfig {

    @Bean
    public RecordMessageConverter converter() {
        ObjectMapper mapper = JacksonUtils.enhancedObjectMapper();
        mapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
        mapper.findAndRegisterModules();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new JsonMessageConverter(mapper);
    }
}
