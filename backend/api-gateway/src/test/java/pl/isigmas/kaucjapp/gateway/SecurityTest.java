package pl.isigmas.kaucjapp.gateway;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.RestClient;

import javax.crypto.SecretKey;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SecurityTest {

    @LocalServerPort
    private int port;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private RestClient restClient;

    @BeforeEach
    void setUp() {
        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .defaultStatusHandler(status -> true, (request, response) -> {
                    // Ignore all errors (check status code without exception)
                })
                .build();

        IO.println("SECRET HERE: " + jwtSecret);
    }

    @Test
    @DisplayName("Should return 401 when no Authorization header is provided")
    void shouldReturn401WhenNoAuthorizationHeader() {
        HttpStatusCode status = restClient.get()
                .uri("/api/test")
                .exchange((request, response) -> response.getStatusCode());

        assertThat(status).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should return 401 when invalid token is provided (different secret key)")
    void shouldReturn401WhenInvalidToken() {
        // Token podpisany innym kluczem niz ten w properties
        String invalidSecret = "InnyKluczKtoryNieJestPoprawny12345!";
        SecretKey invalidKey = Keys.hmacShaKeyFor(invalidSecret.getBytes());

        String invalidToken = Jwts.builder()
                .subject("tester")
                .claim("user_id", 1)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(invalidKey)
                .compact();

        HttpStatusCode status = restClient.get()
                .uri("/api/test")
                .header("Authorization", "Bearer " + invalidToken)
                .exchange((request, response) -> response.getStatusCode());

        assertThat(status).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should return 401 when expired token is provided")
    void shouldReturn401WhenExpiredToken() {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        String expiredToken = Jwts.builder()
                .subject("tester")
                .claim("user_id", 1)
                .issuedAt(new Date(System.currentTimeMillis() - 7200000))
                .expiration(new Date(System.currentTimeMillis() - 3600000))
                .signWith(key)
                .compact();

        HttpStatusCode status = restClient.get()
                .uri("/api/test")
                .header("Authorization", "Bearer " + expiredToken)
                .exchange((request, response) -> response.getStatusCode());

        assertThat(status).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should return 401 when malformed token is provided")
    void shouldReturn401WhenMalformedToken() {
        HttpStatusCode status = restClient.get()
                .uri("/api/test")
                .header("Authorization", "Bearer invalid.token.format")
                .exchange((request, response) -> response.getStatusCode());

        assertThat(status).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should pass security layer with valid token (returns 404 because downstream service is not running)")
    void shouldAllowAccessWithValidToken() {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        String validToken = Jwts.builder()
                .subject("tester")
                .claim("user_id", 1)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

        HttpStatusCode status = restClient.get()
                .uri("/api/test")
                .header("Authorization", "Bearer " + validToken)
                .exchange((request, response) -> response.getStatusCode());

        assertThat(status).isNotIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }
}
