package pl.isigmas.kaucjapp.gateway.config;

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
@Component
@ConfigurationProperties(prefix = "gateway")
public class GatewayProperties {

    private List<Route> routes = new ArrayList<>();

    public List<Route> getRoutes() {
        return routes;
    }

    public void setRoutes(List<Route> routes) {
        this.routes = routes;
    }

    /**
     * Represents a single routing rule mapping an incoming request path
     * to a destination service URI.
     */
    public static class Route {
        private String id;
        private String path;
        private String uri;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public String getUri() {
            return uri;
        }

        public void setUri(String uri) {
            this.uri = uri;
        }
    }
}
