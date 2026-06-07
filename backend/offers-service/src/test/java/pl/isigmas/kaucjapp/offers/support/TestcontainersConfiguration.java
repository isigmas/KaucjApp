package pl.isigmas.kaucjapp.offers.support;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.testcontainers.utility.DockerImageName;

@TestConfiguration(proxyBeanMethods = false)
class TestcontainersConfiguration {

    @Bean
    @ServiceConnection
    @SuppressWarnings("resource")
    PostgreSQLContainer postgresContainer() {
        return new PostgreSQLContainer(DockerImageName.parse("postgres:16-alpine"));
    }
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

}
