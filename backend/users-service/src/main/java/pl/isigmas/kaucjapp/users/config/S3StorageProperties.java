package pl.isigmas.kaucjapp.users.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * S3-compatible object storage used for profile pictures (Cloudflare R2 in production, MinIO in dev).
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "storage.s3")
public class S3StorageProperties {

    /** Endpoint used by this service for HEAD/GET/DELETE, e.g. {@code http://minio:9000}. */
    private String endpoint = "http://localhost:9000";

    /**
     * Endpoint embedded in upload URLs handed to clients. It must be reachable from the device.
     * Falls back to {@link #endpoint} when empty (the case for R2).
     */
    private String publicEndpoint;

    private String region = "auto";

    private String bucket = "profile-pictures";

    private String accessKey;

    private String secretKey;

    /** Base URL (including the bucket for path-style hosts) under which stored pictures are publicly readable. */
    private String publicBaseUrl;

    private long maxFileSizeBytes = 5 * 1024 * 1024;

    /** How long a presigned upload URL stays valid. */
    private int uploadUrlTtlSeconds = 600;

    /** Timeout for server-side calls to the storage. */
    private int requestTimeoutSeconds = 10;
}
