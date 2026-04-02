package pl.isigmas.kaucjapp.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Configuration class for HTTP client infrastructure.
 *
 * <p>
 * This class provides a centralized {@link RestClient.Builder} bean used
 * throughout the application (primarily by the {@code GatewayController})
 * to perform outbound HTTP requests to downstream services.
 * </p>
 */
@Configuration
public class RestClientConfig {

    /**
     * Provides a customizable {@link RestClient.Builder} instance.
     *
     * <p>
     * Using a builder bean instead of a direct {@code RestClient} instance
     * allows different components to further customize the client
     * (e.g., adding specific headers or error handlers) before building it.
     * </p>
     *
     * @return a default {@link RestClient.Builder} instance
     */
    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }
}
