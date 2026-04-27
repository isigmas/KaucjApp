package pl.isigmas.kaucjapp.gateway.config;

import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;

/**
 * Security configuration for the API Gateway.
 *
 * <p>
 * This class configures the security filter chains to manage access control across the gateway.
 * It distinguishes between public endpoints (like authentication) and protected resources
 * that require a valid JWT token.
 * </p>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String secret;

    /**
     * Configures a high-priority filter chain for public authentication endpoints.
     *
     * <p>This chain matches requests starting with {@code /api/auth/} and allows
     * unrestricted access. It is intentionally placed at a higher priority (Order 1)
     * to bypass the OAuth2 resource server validation for login and registration flows.</p>
     *
     * @param http the {@link HttpSecurity} to configure
     * @return the configured {@link SecurityFilterChain}
     */
    @Bean
    @Order(1)
    public SecurityFilterChain publicSecurityFilterChain(HttpSecurity http) {
        http
                .securityMatcher(request -> {
                    String path = request.getRequestURI();
                    return path != null && path.startsWith("/api/auth/") && !path.contains("/admin/");
                })
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().permitAll()
                );
        return http.build();
    }

    /**
     * Configures the default filter chain for protected resource endpoints.
     *
     * <p>This chain acts as an OAuth2 Resource Server, requiring a valid JWT for all
     * requests. It also allows internal {@link DispatcherType#ERROR} dispatches to
     * ensure that exception handlers can process errors without being blocked by
     * authentication requirements.</p>
     *
     * @param http the {@link HttpSecurity} to configure
     * @return the configured {@link SecurityFilterChain}
     */
    @Bean
    @Order(2)
    public SecurityFilterChain protectedSecurityFilterChain(HttpSecurity http) {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // Allow internal error dispatches (DispatcherType.ERROR) but block direct requests to /error from outside
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers("/api/*/admin/**", "/api/*/*/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );
        return http.build();
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("role");
            if (role == null || role.isBlank()) {
                return Collections.emptyList();
            }
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
        });
        return converter;
    }

    /**
     * Defines the {@link JwtDecoder} bean for validating incoming tokens.
     * <p>Uses a symmetric key (HMAC-SHA256) based on the configured application secret.</p>
     *
     * @return a configured {@link NimbusJwtDecoder}
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKey secretKey = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(secretKey).build();
    }
}
