package pl.isigmas.kaucjapp.users.service;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.UploadUrlDTO;
import pl.isigmas.kaucjapp.users.config.S3StorageProperties;
import pl.isigmas.kaucjapp.users.exception.ProfilePictureUploadException;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Runs the service against a tiny in-memory fake of an S3-compatible endpoint. */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProfilePictureStorageServiceTest {

    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0x10, 'J', 'F', 'I', 'F', 0, 1, 2, 3};
    private static final byte[] NOT_AN_IMAGE = "<html>definitely not an image</html>".getBytes();

    @Mock
    private Logger logger;

    private HttpServer server;
    private final Map<String, byte[]> objects = new ConcurrentHashMap<>();
    private final Map<String, String> contentTypes = new ConcurrentHashMap<>();
    private final List<String> deletes = new CopyOnWriteArrayList<>();
    private ProfilePictureStorageService service;
    private S3StorageProperties properties;

    @BeforeEach
    void setUp() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/test-bucket/", exchange -> {
            String key = exchange.getRequestURI().getPath().substring("/test-bucket/".length());
            String query = exchange.getRequestURI().getRawQuery();
            if (query == null || !query.contains("X-Amz-Signature=")) {
                exchange.sendResponseHeaders(403, -1);
                exchange.close();
                return;
            }
            byte[] body = objects.get(key);
            switch (exchange.getRequestMethod()) {
                case "HEAD" -> {
                    if (body == null) {
                        exchange.sendResponseHeaders(404, -1);
                    } else {
                        exchange.getResponseHeaders().add("Content-Type", contentTypes.getOrDefault(key, "image/jpeg"));
                        // HEAD responses announce the length without a body
                        exchange.getResponseHeaders().add("Content-Length", String.valueOf(body.length));
                        exchange.sendResponseHeaders(200, -1);
                    }
                }
                case "GET" -> {
                    if (body == null) {
                        exchange.sendResponseHeaders(404, -1);
                    } else {
                        byte[] part = java.util.Arrays.copyOf(body, Math.min(body.length, 12));
                        exchange.sendResponseHeaders(206, part.length);
                        exchange.getResponseBody().write(part);
                    }
                }
                case "DELETE" -> {
                    deletes.add(key);
                    objects.remove(key);
                    exchange.sendResponseHeaders(204, -1);
                }
                default -> exchange.sendResponseHeaders(405, -1);
            }
            exchange.close();
        });
        server.start();

        properties = new S3StorageProperties();
        properties.setEndpoint("http://127.0.0.1:" + server.getAddress().getPort());
        properties.setBucket("test-bucket");
        properties.setAccessKey("ak");
        properties.setSecretKey("sk");
        properties.setPublicBaseUrl("https://cdn.example.com");
        properties.setMaxFileSizeBytes(1024);
        service = new ProfilePictureStorageService(properties, logger);
    }

    @AfterEach
    void tearDown() {
        server.stop(0);
    }

    @Test
    void generateUploadUrl_returnsPresignedPutForUserOwnedKey() {
        UploadUrlDTO dto = service.generateUploadUrl(3L, "image/png");

        assertThat(dto.blobName()).startsWith("user-3-").endsWith(".png");
        assertThat(dto.uploadUrl()).contains("/test-bucket/" + dto.blobName() + "?")
                .contains("X-Amz-Signature=")
                .contains("content-type");
    }

    @Test
    void generateUploadUrl_rejectsUnsupportedContentType() {
        assertThatThrownBy(() -> service.generateUploadUrl(3L, "application/pdf"))
                .isInstanceOf(ProfilePictureUploadException.class);
    }

    @Test
    void confirm_validUpload_returnsPublicUrl() {
        objects.put("user-3-abc.jpg", JPEG);

        assertThat(service.confirmProfilePicture(3L, "user-3-abc.jpg"))
                .isEqualTo("https://cdn.example.com/user-3-abc.jpg");
    }

    @Test
    void confirm_foreignOrMalformedBlobName_throws() {
        assertThatThrownBy(() -> service.confirmProfilePicture(3L, "user-99-other.jpg"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("Invalid blob name");
        assertThatThrownBy(() -> service.confirmProfilePicture(3L, "user-3-abc.gif"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("extension");
    }

    @Test
    void confirm_missingObject_throws() {
        assertThatThrownBy(() -> service.confirmProfilePicture(3L, "user-3-missing.jpg"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("Upload not found");
    }

    @Test
    void confirm_oversizedObject_throwsAndDeletesIt() {
        objects.put("user-3-big.jpg", new byte[2048]);

        assertThatThrownBy(() -> service.confirmProfilePicture(3L, "user-3-big.jpg"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("maximum allowed size");
        assertThat(deletes).containsExactly("user-3-big.jpg");
    }

    @Test
    void confirm_disallowedContentType_throws() {
        objects.put("user-3-abc.jpg", JPEG);
        contentTypes.put("user-3-abc.jpg", "text/html");

        assertThatThrownBy(() -> service.confirmProfilePicture(3L, "user-3-abc.jpg"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("JPEG, PNG and WebP");
    }

    @Test
    void confirm_wrongMagicBytes_throwsAndDeletesIt() {
        objects.put("user-3-fake.jpg", NOT_AN_IMAGE);

        assertThatThrownBy(() -> service.confirmProfilePicture(3L, "user-3-fake.jpg"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("JPEG, PNG and WebP");
        assertThat(deletes).containsExactly("user-3-fake.jpg");
    }

    @Test
    void deleteByStoredUrl_deletesOnlyObjectsUnderPublicBase() {
        objects.put("user-3-old.jpg", JPEG);

        service.deleteByStoredUrl("https://cdn.example.com/user-3-old.jpg");
        service.deleteByStoredUrl("https://evil.example.org/user-3-other.jpg");
        service.deleteByStoredUrl(null);
        service.deleteByStoredUrl("");

        assertThat(deletes).containsExactly("user-3-old.jpg");
    }

    @Test
    void hasImageSignature_recognisesSupportedFormats() {
        byte[] png = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
        byte[] webp = {'R', 'I', 'F', 'F', 1, 2, 3, 4, 'W', 'E', 'B', 'P'};

        assertThat(ProfilePictureStorageService.hasImageSignature(JPEG)).isTrue();
        assertThat(ProfilePictureStorageService.hasImageSignature(png)).isTrue();
        assertThat(ProfilePictureStorageService.hasImageSignature(webp)).isTrue();
        assertThat(ProfilePictureStorageService.hasImageSignature(NOT_AN_IMAGE)).isFalse();
        assertThat(ProfilePictureStorageService.hasImageSignature(null)).isFalse();
    }
}
