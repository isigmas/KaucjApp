package pl.isigmas.kaucjapp.users.storage;

import org.junit.jupiter.api.Test;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class S3PresignerTest {

    private static final String ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
    private static final String SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

    /** Official example from the AWS docs: "Authenticating Requests: Using Query Parameters (AWS Signature Version 4)". */
    @Test
    void matchesOfficialAwsExampleSignature() {
        S3Presigner presigner = new S3Presigner(ACCESS_KEY, SECRET_KEY, "us-east-1");

        String url = presigner.presignPath(
                "GET",
                "https",
                "examplebucket.s3.amazonaws.com",
                "/test.txt",
                Duration.ofSeconds(86400),
                Instant.parse("2013-05-24T00:00:00Z"),
                Map.of()
        );

        assertThat(url).isEqualTo(
                "https://examplebucket.s3.amazonaws.com/test.txt"
                        + "?X-Amz-Algorithm=AWS4-HMAC-SHA256"
                        + "&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request"
                        + "&X-Amz-Date=20130524T000000Z"
                        + "&X-Amz-Expires=86400"
                        + "&X-Amz-SignedHeaders=host"
                        + "&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404");
    }

    @Test
    void usesPathStyleAndKeepsNonDefaultPortInHost() {
        S3Presigner presigner = new S3Presigner(ACCESS_KEY, SECRET_KEY, "auto");

        String url = presigner.presign(
                "PUT",
                URI.create("http://localhost:9000"),
                "profile-pictures",
                "user-1-abc.jpg",
                Duration.ofMinutes(10),
                Instant.parse("2026-01-01T00:00:00Z"),
                Map.of("Content-Type", "image/jpeg")
        );

        assertThat(url).startsWith("http://localhost:9000/profile-pictures/user-1-abc.jpg?");
        assertThat(url).contains("X-Amz-SignedHeaders=content-type%3Bhost");
        assertThat(url).contains("X-Amz-Expires=600");
        assertThat(url).containsPattern("X-Amz-Signature=[0-9a-f]{64}$");
    }

    @Test
    void signatureDependsOnMethodAndSignedHeaders() {
        S3Presigner presigner = new S3Presigner(ACCESS_KEY, SECRET_KEY, "auto");
        URI endpoint = URI.create("https://acc.r2.cloudflarestorage.com");
        Instant now = Instant.parse("2026-01-01T00:00:00Z");

        String put = presigner.presign("PUT", endpoint, "b", "k.jpg", Duration.ofMinutes(1), now, Map.of());
        String get = presigner.presign("GET", endpoint, "b", "k.jpg", Duration.ofMinutes(1), now, Map.of());
        String putTyped = presigner.presign("PUT", endpoint, "b", "k.jpg", Duration.ofMinutes(1), now,
                Map.of("content-type", "image/png"));

        assertThat(put).isNotEqualTo(get).isNotEqualTo(putTyped);
        assertThat(presigner.presign("PUT", endpoint, "b", "k.jpg", Duration.ofMinutes(1), now, Map.of()))
                .isEqualTo(put);
    }
}
