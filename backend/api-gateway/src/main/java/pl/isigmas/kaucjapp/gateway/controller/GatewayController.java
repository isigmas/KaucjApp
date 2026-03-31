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
import pl.isigmas.kaucjapp.gateway.config.GatewayProperties;

import java.util.Enumeration;
import java.util.List;

@RestController
public class GatewayController {

    private final RestClient restClient;
    private final GatewayProperties gatewayProperties;

    private static final List<String> HOP_BY_HOP_HEADERS = List.of(
            "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
            "te", "trailers", "transfer-encoding", "upgrade", "host"
    );

    public GatewayController(RestClient.Builder restClientBuilder, GatewayProperties gatewayProperties) {
        this.restClient = restClientBuilder.build();
        this.gatewayProperties = gatewayProperties;
    }

    @RequestMapping("/**")
    public ResponseEntity<byte[]> proxy(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        String requestPath = request.getRequestURI();
        String queryString = request.getQueryString();
        
        // Znajdź pasujący route
        GatewayProperties.Route matchedRoute = findMatchingRoute(requestPath);
        if (matchedRoute == null) {
            return ResponseEntity.notFound().build();
        }

        // Zbuduj docelowy URL
        String targetUrl = buildTargetUrl(matchedRoute, requestPath, queryString);

        // Wykonaj request do downstream service
        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        
        RestClient.RequestBodySpec requestSpec = restClient
                .method(method)
                .uri(targetUrl);

        // Przekopiuj nagłówki (bez hop-by-hop)
        copyHeaders(request, requestSpec);
        
        // Dodaj X-User-Id z JWT
        addUserIdHeader(requestSpec);

        // Dodaj body jeśli istnieje
        if (body != null && body.length > 0) {
            requestSpec.body(body);
        }

        // Wykonaj request i zwróć odpowiedź
        return requestSpec
                .exchange((req, res) -> {
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
    }

    private GatewayProperties.Route findMatchingRoute(String requestPath) {
        for (GatewayProperties.Route route : gatewayProperties.getRoutes()) {
            String pathPattern = route.getPath();
            // Obsługa wzorca /api/** -> /api/
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

    private String buildTargetUrl(GatewayProperties.Route route, String requestPath, String queryString) {
        StringBuilder url = new StringBuilder(route.getUri());
        
        // Usuń trailing slash z URI jeśli istnieje
        if (url.charAt(url.length() - 1) == '/') {
            url.deleteCharAt(url.length() - 1);
        }
        
        url.append(requestPath);
        
        if (queryString != null && !queryString.isEmpty()) {
            url.append("?").append(queryString);
        }
        
        return url.toString();
    }

    private void copyHeaders(HttpServletRequest request, RestClient.RequestBodySpec requestSpec) {
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (!HOP_BY_HOP_HEADERS.contains(headerName.toLowerCase())) {
                Enumeration<String> headerValues = request.getHeaders(headerName);
                while (headerValues.hasMoreElements()) {
                    requestSpec.header(headerName, headerValues.nextElement());
                }
            }
        }
    }

    private void addUserIdHeader(RestClient.RequestBodySpec requestSpec) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            Object userIdObj = jwt.getClaims().get("user_id");
            
            if (userIdObj != null) {
                requestSpec.header("X-User-Id", String.valueOf(userIdObj));
            }
        }
    }
}
