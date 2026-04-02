package pl.isigmas.kaucjapp.gateway;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.*;
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

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayHeadersTest {

    private static final WireMockServer wireMockServer = new WireMockServer(0);

    @LocalServerPort
    private int port;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private RestClient restClient;

    @BeforeAll
    static void startWireMock() {
        wireMockServer.start();
        WireMock.configureFor("localhost", wireMockServer.port());
    }

    @AfterAll
    static void stopWireMock() {
        wireMockServer.stop();
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        wireMockServer.start();
        registry.add("gateway.routes[0].id", () -> "test-service");
        registry.add("gateway.routes[0].path", () -> "/api/**");
        registry.add("gateway.routes[0].uri", () -> "http://localhost:" + wireMockServer.port());
    }

    @BeforeEach
    void setUp() {
        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .defaultStatusHandler(status -> true, (request, response) -> {
                    // Ignore all errors
                })
                .build();
        wireMockServer.resetAll();
    }

    @Test
    @DisplayName("Should forward X-User-Id header from JWT token to downstream service")
    void shouldForwardUserIdHeaderFromJwtToken() {
        // Given
        Long expectedUserId = 12345L;
        String validToken = createValidToken(expectedUserId);

        stubFor(get(urlEqualTo("/api/test"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withBody("OK")));

        // When
        HttpStatusCode status = restClient.get()
                .uri("/api/test")
                .header("Authorization", "Bearer " + validToken)
                .exchange((request, response) -> response.getStatusCode());

        // Then
        assertThat(status).isEqualTo(HttpStatus.OK);

        verify(getRequestedFor(urlEqualTo("/api/test"))
                .withHeader("X-User-Id", equalTo(String.valueOf(expectedUserId))));
    }

    @Test
    @DisplayName("Should forward X-User-Id header with different user IDs")
    void shouldForwardUserIdHeaderWithDifferentUserIds() {
        // Given
        Long expectedUserId = 999L;
        String validToken = createValidToken(expectedUserId);

        stubFor(get(urlEqualTo("/api/users/profile"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withBody("{\"id\": 999}")));

        // When
        HttpStatusCode status = restClient.get()
                .uri("/api/users/profile")
                .header("Authorization", "Bearer " + validToken)
                .exchange((request, response) -> response.getStatusCode());

        // Then
        assertThat(status).isEqualTo(HttpStatus.OK);

        verify(getRequestedFor(urlEqualTo("/api/users/profile"))
                .withHeader("X-User-Id", equalTo("999")));
    }

    @Test
    @DisplayName("Should not include X-User-Id header when JWT does not contain user_id claim")
    void shouldNotIncludeUserIdHeaderWhenJwtHasNoUserIdClaim() {
        // Given
        String tokenWithoutUserId = createTokenWithoutUserId();

        stubFor(get(urlEqualTo("/api/test"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withBody("OK")));

        // When
        HttpStatusCode status = restClient.get()
                .uri("/api/test")
                .header("Authorization", "Bearer " + tokenWithoutUserId)
                .exchange((request, response) -> response.getStatusCode());

        // Then
        assertThat(status).isEqualTo(HttpStatus.OK);

        verify(getRequestedFor(urlEqualTo("/api/test"))
                .withoutHeader("X-User-Id"));
    }

    @Test
    @DisplayName("Should forward X-User-Id header for POST requests")
    void shouldForwardUserIdHeaderForPostRequests() {
        // Given
        Long expectedUserId = 777L;
        String validToken = createValidToken(expectedUserId);

        stubFor(post(urlEqualTo("/api/items"))
                .willReturn(aResponse()
                        .withStatus(201)
                        .withBody("{\"id\": 1}")));

        // When
        HttpStatusCode status = restClient.post()
                .uri("/api/items")
                .header("Authorization", "Bearer " + validToken)
                .header("Content-Type", "application/json")
                .body("{\"name\": \"test\"}")
                .exchange((request, response) -> response.getStatusCode());

        // Then
        assertThat(status).isEqualTo(HttpStatus.CREATED);

        verify(postRequestedFor(urlEqualTo("/api/items"))
                .withHeader("X-User-Id", equalTo("777")));
    }

    @Test
    @DisplayName("Should forward X-User-Id header with integer user_id claim")
    void shouldForwardUserIdHeaderWithIntegerClaim() {
        // Given - Integer user_id (nie Long)
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        String validToken = Jwts.builder()
                .subject("tester")
                .claim("user_id", 42) // Integer
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

        stubFor(get(urlEqualTo("/api/test"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withBody("OK")));

        // When
        HttpStatusCode status = restClient.get()
                .uri("/api/test")
                .header("Authorization", "Bearer " + validToken)
                .exchange((request, response) -> response.getStatusCode());

        // Then
        assertThat(status).isEqualTo(HttpStatus.OK);

        verify(getRequestedFor(urlEqualTo("/api/test"))
                .withHeader("X-User-Id", equalTo("42")));
    }

    private String createValidToken(Long userId) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.builder()
                .subject("tester")
                .claim("user_id", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    private String createTokenWithoutUserId() {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.builder()
                .subject("tester")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }
}
