package pl.isigmas.kaucjapp.gateway.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Configuration properties for the API Gateway routing logic.
 *
 * <p>
 * This class binds external configuration (e.g., from {@code application.yml})
 * with the prefix {@code gateway} to a structured list of route definitions.
 * It allows for dynamic management of downstream service endpoints and their path patterns.
 * </p>
 */
@Setter
@Getter
@Component
@ConfigurationProperties(prefix = "gateway")
public class GatewayProperties {

    private List<Route> routes = new ArrayList<>();

    /**
     * Represents a single routing rule mapping an incoming request path
     * to a destination service URI.
     */
    @Setter
    @Getter
    public static class Route {
        private String id;
        private String path;
        private String uri;

    }
}
