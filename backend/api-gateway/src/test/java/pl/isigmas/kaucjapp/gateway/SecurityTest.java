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
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.RestClient;

import javax.crypto.SecretKey;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SecurityTest {

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("JWT_SECRET", () -> "0123456789abcdef0123456789abcdef");
    }

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
        // Token sign with a different secret key than the one configured in the application
        String invalidSecret = "OtherNotValidSecretKey1234567890!";
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
                .claim("role", "tester")
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

    @Test
    @DisplayName("Should allow access to admin endpoint when role is ADMIN")
    void shouldAllowAccessToAdminEndpointWithTesterRole() {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        String testerToken = Jwts.builder()
                .subject("tester")
                .claim("user_id", 1)
                .claim("role", "ADMIN")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

        HttpStatusCode status = restClient.get()
                .uri("/api/something/admin/test")
                .header("Authorization", "Bearer " + testerToken)
                .exchange((request, response) -> response.getStatusCode());

        // Should pass 401/403 and hit the missing route (404/503/etc)
        assertThat(status).isNotIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("Should block access to admin endpoint when role is user")
    void shouldBlockAccessToAdminEndpointWithUserRole() {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        String userToken = Jwts.builder()
                .subject("user")
                .claim("user_id", 2)
                .claim("role", "user")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

        HttpStatusCode status = restClient.get()
                .uri("/api/something/admin/test")
                .header("Authorization", "Bearer " + userToken)
                .exchange((request, response) -> response.getStatusCode());

        // Should return 403 Forbidden because it lacks the "tester" role
        assertThat(status).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("Should block access to admin endpoint when token is missing role")
    void shouldBlockAccessToAdminEndpointWithMissingRole() {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        String noRoleToken = Jwts.builder()
                .subject("user")
                .claim("user_id", 3)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

        HttpStatusCode status = restClient.get()
                .uri("/api/something/admin/test")
                .header("Authorization", "Bearer " + noRoleToken)
                .exchange((request, response) -> response.getStatusCode());

        // Should return 403 Forbidden because it lacks the "tester" role
        assertThat(status).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("Should allow access to /api/auth/** without token (public endpoint)")
    void shouldAllowAccessToAuthEndpointWithoutToken() {
        HttpStatusCode status = restClient.post()
                .uri("/api/auth/login")
                .exchange((request, response) -> response.getStatusCode());

        // Endpoint /api/auth/* should be accessible without token, we expect 500 because downstream service is not running, but NOT 401/403
        assertThat(status).isNotIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("Should allow access to /api/auth/register without token")
    void shouldAllowAccessToRegisterEndpointWithoutToken() {
        HttpStatusCode status = restClient.post()
                .uri("/api/auth/register")
                .exchange((request, response) -> response.getStatusCode());

        assertThat(status).isNotIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("Should block direct access to /error endpoint without token")
    void shouldBlockDirectAccessToErrorEndpointWithoutToken() {
        HttpStatusCode status = restClient.get()
                .uri("/error")
                .exchange((request, response) -> response.getStatusCode());

        // Direct request to /error should be blocked (401)
        assertThat(status).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should block access to /api/auth/admin/** without token")
    void shouldBlockAccessToAuthAdminEndpointWithoutToken() {
        HttpStatusCode status = restClient.get()
                .uri("/api/auth/admin/status")
                .exchange((request, response) -> response.getStatusCode());

        assertThat(status).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should block access to other service admin endpoint without token")
    void shouldBlockAccessToOtherAdminEndpointWithoutToken() {
        HttpStatusCode status = restClient.get()
                .uri("/api/something/admin/test")
                .exchange((request, response) -> response.getStatusCode());

        assertThat(status).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
