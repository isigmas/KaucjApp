package pl.isigmas.kaucjapp.gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.ResourceAccessException;
import pl.isigmas.kaucjapp.gateway.config.GatewayProperties;
import pl.isigmas.kaucjapp.gateway.exception.DownstreamTimeoutException;
import pl.isigmas.kaucjapp.gateway.exception.DownstreamUnavailableException;
import pl.isigmas.kaucjapp.gateway.exception.HeaderInjectionException;
import pl.isigmas.kaucjapp.gateway.exception.InvalidRouteConfigurationException;
import pl.isigmas.kaucjapp.gateway.exception.RouteNotFoundException;

import java.net.SocketTimeoutException;
import java.util.Enumeration;
import java.util.List;

/**
 * Main entry point for the API Gateway logic.
 *
 * <p>
 * This controller acts as a dynamic reverse proxy. It intercepts all incoming requests,
 * matches them against defined routes, and forwards them to the appropriate downstream services.
 * It also handles security context propagation and header sanitization.
 * </p>
 */
@RestController
public class GatewayController {

    private final RestClient restClient;
    private final GatewayProperties gatewayProperties;

    /**
     * List of Hop-by-hop headers that should not be forwarded by the proxy.
     * Defined as per RFC 2616.
     */
    private static final List<String> HOP_BY_HOP_HEADERS = List.of(
            "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
            "te", "trailers", "transfer-encoding", "upgrade", "host", "content-length"
    );

    /**
     * List of headers that should be blocked, because they are meant for internal use only.
     */
    private static final List<String> BLOCKED_HEADERS = List.of(
            "x-internal-secret",
            "x-user-id"
    );

    public GatewayController(RestClient.Builder restClientBuilder, GatewayProperties gatewayProperties) {
        this.restClient = restClientBuilder.build();
        this.gatewayProperties = gatewayProperties;
    }

    /**
     * Intercepts all requests and proxies them to the matching downstream service.
     *
     * <p>The process follows these steps:</p>
     * <ol>
     * <li>Match the request URI to a configured route.</li>
     * <li>Construct the target URL for the downstream service.</li>
     * <li>Filter and copy request headers (removing hop-by-hop headers).</li>
     * <li>Inject security headers (e.g., {@code X-User-Id}) from the JWT token.</li>
     * <li>Forward the request body and return the downstream response.</li>
     * </ol>
     *
     * @param request the incoming {@link HttpServletRequest}
     * @param body the raw request body as a byte array (optional)
     * @return a {@link ResponseEntity} containing the response from the downstream service
     */
    @RequestMapping("/**")
    public ResponseEntity<byte[]> proxy(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        String requestPath = request.getRequestURI();
        String queryString = request.getQueryString();
        
        // Find matching route
        GatewayProperties.Route matchedRoute = findMatchingRoute(requestPath);
        if (matchedRoute == null) {
            throw new RouteNotFoundException(requestPath);
        }

        // Build target URL
        String targetUrl = buildTargetUrl(matchedRoute, requestPath, queryString);

        // Perform the request to the downstream service
        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        
        RestClient.RequestBodySpec requestSpec = restClient
                .method(method)
                .uri(targetUrl);

        // Copy headers from the original request, excluding hop-by-hop headers
        copyHeaders(request, requestSpec);
        
        // Add X-User-Id from JWT
        addUserIdHeader(requestSpec);

        // Add body if it exists
        if (body != null && body.length > 0) {
            requestSpec.body(body);
        }

        // Perform the request and return the response
        try {
            return requestSpec.exchange((req, res) -> {
                HttpHeaders responseHeaders = new HttpHeaders();
                res.getHeaders().forEach((name, values) -> {
                    if (!HOP_BY_HOP_HEADERS.contains(name.toLowerCase())) {
                        responseHeaders.addAll(name, values);
                    }
                });

                byte[] responseBody = res.getBody().readAllBytes();
                return ResponseEntity
                        .status(res.getStatusCode())
                        .headers(responseHeaders)
                        .body(responseBody);
            });
        } catch (ResourceAccessException ex) {
            if (isTimeout(ex)) {
                throw new DownstreamTimeoutException(targetUrl);
            }
            throw new DownstreamUnavailableException(targetUrl);
        }
    }

    /**
     * Finds a matching route based on the incoming request path.
     * Supports prefix matching (e.g., {@code /api/**}) and exact path matching.
     *
     * @param requestPath the URI path to match
     * @return the matching {@link GatewayProperties.Route} or {@code null} if no route is found
     */
    private GatewayProperties.Route findMatchingRoute(String requestPath) {
        for (GatewayProperties.Route route : gatewayProperties.getRoutes()) {
            String pathPattern = route.getPath();
            // Pattern /api/** -> /api/
            if (pathPattern.endsWith("/**")) {
                String prefix = pathPattern.substring(0, pathPattern.length() - 2);
                if (requestPath.startsWith(prefix)) {
                    return route;
                }
            } else if (requestPath.equals(pathPattern) || requestPath.startsWith(pathPattern + "/")) {
                return route;
            }
        }
        return null;
    }

    /**
     * Constructs the full target URL for the downstream request.
     *
     * @param route the matched route configuration
     * @param requestPath the original request URI
     * @param queryString the original query parameters
     * @return the formatted target URL string
     */
    private String buildTargetUrl(GatewayProperties.Route route, String requestPath, String queryString) {
        String uri = route.getUri();
        if (uri == null || uri.isBlank()) {
            throw new InvalidRouteConfigurationException("Route '" + route.getId() + "' has empty uri");
        }

        StringBuilder url = new StringBuilder(uri);
        
        // Delete trailing slash from URI if it exists
        if (url.charAt(url.length() - 1) == '/') {
            url.deleteCharAt(url.length() - 1);
        }
        
        url.append(requestPath);
        
        if (queryString != null && !queryString.isEmpty()) {
            url.append("?").append(queryString);
        }
        
        return url.toString();
    }

    /**
     * Copies headers from the incoming request to the proxy request.
     * Filters out hop-by-hop and blocked internal headers.
     *
     * @param request the source {@link HttpServletRequest}
     * @param requestSpec the target {@link RestClient.RequestBodySpec}
     */
    private void copyHeaders(HttpServletRequest request, RestClient.RequestBodySpec requestSpec) {
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String normalizedHeaderName = headerName.toLowerCase();
            if (!HOP_BY_HOP_HEADERS.contains(normalizedHeaderName)
                    && !BLOCKED_HEADERS.contains(normalizedHeaderName)) {
                Enumeration<String> headerValues = request.getHeaders(headerName);
                while (headerValues.hasMoreElements()) {
                    requestSpec.header(headerName, headerValues.nextElement());
                }
            }
        }
    }

    /**
     * Extracts the {@code user_id} claim from the current {@link JwtAuthenticationToken}
     * and injects it into the proxy request as an {@code X-User-Id} header.
     * * <p>This allows downstream services to identify the authenticated user without
     * re-parsing the full JWT token.</p>
     *
     * @param requestSpec the current request specification
     */
    private void addUserIdHeader(RestClient.RequestBodySpec requestSpec) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            Object userIdObj = jwt.getClaims().get("user_id");
            
            if (userIdObj == null) {
                return;
            }

            String userId = normalizeUserIdClaim(userIdObj);
            requestSpec.header("X-User-Id", userId);
        }
    }

    private String normalizeUserIdClaim(Object userIdObj) {
        if (userIdObj instanceof Number) {
            return String.valueOf(userIdObj);
        }
        if (userIdObj instanceof String s) {
            String trimmed = s.trim();
            if (trimmed.isEmpty()) {
                throw new HeaderInjectionException("/", "user_id claim is empty");
            }
            if (!trimmed.matches("\\d+")) {
                throw new HeaderInjectionException("/", "user_id claim must be numeric");
            }
            return trimmed;
        }
        throw new HeaderInjectionException("/", "user_id claim has unsupported type: " + userIdObj.getClass().getSimpleName());
    }

    private static boolean isTimeout(ResourceAccessException ex) {
        Throwable t = ex;
        while (t != null) {
            if (t instanceof SocketTimeoutException) {
                return true;
            }
            t = t.getCause();
        }
        return false;
    }
}
