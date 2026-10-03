package pl.isigmas.kaucjapp.users.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.UploadUrlDTO;
import pl.isigmas.kaucjapp.users.config.S3StorageProperties;
import pl.isigmas.kaucjapp.users.exception.ProfilePictureUploadException;
import pl.isigmas.kaucjapp.users.storage.S3Presigner;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Profile picture storage on an S3-compatible bucket (Cloudflare R2 in production, MinIO in dev).
 *
 * <p>Clients upload directly to the bucket through a presigned PUT URL. The service then validates the stored
 * object (ownership, size, content type, magic bytes) before the public URL is saved in the database.
 */
@Slf4j
@Service
public class ProfilePictureStorageService {

    private static final int MAGIC_BYTES_LENGTH = 12;

    private final S3StorageProperties properties;
    private final Logger logger;
    private final S3Presigner presigner;
    private final HttpClient httpClient;
    private final URI internalEndpoint;
    private final URI clientEndpoint;

    public ProfilePictureStorageService(S3StorageProperties properties, Logger logger) {
        this.properties = properties;
        this.logger = logger;
        this.presigner = new S3Presigner(properties.getAccessKey(), properties.getSecretKey(), properties.getRegion());
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(properties.getRequestTimeoutSeconds()))
                .build();
        this.internalEndpoint = URI.create(properties.getEndpoint());
        this.clientEndpoint = StringUtils.hasText(properties.getPublicEndpoint())
                ? URI.create(properties.getPublicEndpoint())
                : internalEndpoint;
        log.info("Profile picture storage ready: endpoint={}, bucket={}, publicBase={}",
                properties.getEndpoint(), properties.getBucket(), properties.getPublicBaseUrl());
    }

    public UploadUrlDTO generateUploadUrl(Long userId, String contentType) {
        String normalized = normalizeContentType(contentType);
        String extension = extensionForContentType(normalized);
        String blobName = "user-" + userId + "-" + UUID.randomUUID() + "." + extension;

        String uploadUrl = presigner.presign(
                "PUT",
                clientEndpoint,
                properties.getBucket(),
                blobName,
                Duration.ofSeconds(properties.getUploadUrlTtlSeconds()),
                Instant.now(),
                Map.of("content-type", canonicalContentType(normalized))
        );
        return new UploadUrlDTO(uploadUrl, blobName);
    }

    /**
     * Validates ownership, existence, size, content type and file signature of an uploaded object,
     * then returns the public URL to store in the database. Invalid uploads are removed from the bucket.
     */
    public String confirmProfilePicture(Long userId, String blobName) {
        validateBlobNameForUser(userId, blobName);

        HttpResponse<Void> head = send("HEAD", blobName, null, HttpResponse.BodyHandlers.discarding());
        if (head.statusCode() == 404) {
            log.warn("Profile picture upload not found for user ID: {}, blob: {}", userId, blobName);
            logger.warn("Profile picture upload not found for user ID: %d, blob: %s".formatted(userId, blobName));
            throw new ProfilePictureUploadException(
                    "Upload not found; PUT the image to the upload URL before confirming");
        }
        if (head.statusCode() != 200) {
            log.error("Storage HEAD failed for {}: HTTP {}", blobName, head.statusCode());
            logger.error("Storage HEAD failed for %s: HTTP %d".formatted(blobName, head.statusCode()));
            throw ProfilePictureUploadException.storageFailed();
        }

        long size = head.headers().firstValueAsLong("content-length").orElse(-1);
        if (size <= 0 || size > properties.getMaxFileSizeBytes()) {
            rejectUpload(blobName, "Profile picture exceeds maximum allowed size");
        }

        String storedType = head.headers().firstValue("content-type").orElse(null);
        if (!isAllowedImageContentType(storedType)) {
            rejectUpload(blobName, "Only JPEG, PNG and WebP images are allowed");
        }

        if (!hasImageSignature(readFirstBytes(blobName))) {
            rejectUpload(blobName, "Only JPEG, PNG and WebP images are allowed");
        }

        return publicUrl(blobName);
    }

    /** Best-effort removal of a previously stored profile picture, identified by its public URL. */
    public void deleteByStoredUrl(String profilePictureUrl) {
        if (!StringUtils.hasText(profilePictureUrl)) {
            return;
        }
        String key = extractKey(profilePictureUrl);
        if (key == null) {
            log.debug("Skipping delete, URL is outside the configured public base: {}", profilePictureUrl);
            return;
        }
        deleteQuietly(key);
    }

    private void rejectUpload(String blobName, String message) {
        log.warn("Rejecting profile picture {}: {}", blobName, message);
        logger.warn("Rejecting profile picture %s: %s".formatted(blobName, message));
        deleteQuietly(blobName);
        throw new ProfilePictureUploadException(message);
    }

    private void deleteQuietly(String key) {
        try {
            HttpResponse<Void> response = send("DELETE", key, null, HttpResponse.BodyHandlers.discarding());
            int status = response.statusCode();
            if (status >= 200 && status < 300) {
                log.info("Deleted profile picture object: {}", key);
                logger.info("Deleted profile picture object: %s".formatted(key));
            } else if (status != 404) {
                log.warn("Could not delete profile picture {}: HTTP {}", key, status);
                logger.warn("Could not delete profile picture %s: HTTP %d".formatted(key, status));
            }
        } catch (RuntimeException e) {
            log.warn("Could not delete profile picture {}: {}", key, e.getMessage());
            logger.warn("Could not delete profile picture %s: %s".formatted(key, e.getMessage()));
        }
    }

    private byte[] readFirstBytes(String key) {
        HttpResponse<byte[]> response = send(
                "GET", key, "bytes=0-" + (MAGIC_BYTES_LENGTH - 1), HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() != 200 && response.statusCode() != 206) {
            log.error("Storage GET failed for {}: HTTP {}", key, response.statusCode());
            logger.error("Storage GET failed for %s: HTTP %d".formatted(key, response.statusCode()));
            throw ProfilePictureUploadException.storageFailed();
        }
        return response.body();
    }

    private <T> HttpResponse<T> send(String method, String key, String range, HttpResponse.BodyHandler<T> handler) {
        String url = presigner.presign(
                method,
                internalEndpoint,
                properties.getBucket(),
                key,
                Duration.ofSeconds(60),
                Instant.now(),
                Map.of()
        );
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(properties.getRequestTimeoutSeconds()))
                .method(method, HttpRequest.BodyPublishers.noBody());
        if (range != null) {
            request.header("Range", range);
        }
        try {
            return httpClient.send(request.build(), handler);
        } catch (IOException e) {
            log.error("Storage request {} {} failed: {}", method, key, e.getMessage());
            logger.error("Storage request %s %s failed: %s".formatted(method, key, e.getMessage()));
            throw ProfilePictureUploadException.storageFailed();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw ProfilePictureUploadException.storageFailed();
        }
    }

    static boolean hasImageSignature(byte[] head) {
        if (head == null || head.length < 3) {
            return false;
        }
        boolean jpeg = (head[0] & 0xff) == 0xFF && (head[1] & 0xff) == 0xD8 && (head[2] & 0xff) == 0xFF;
        boolean png = head.length >= 8
                && (head[0] & 0xff) == 0x89 && head[1] == 'P' && head[2] == 'N' && head[3] == 'G'
                && head[4] == 0x0D && head[5] == 0x0A && head[6] == 0x1A && head[7] == 0x0A;
        boolean webp = head.length >= 12
                && head[0] == 'R' && head[1] == 'I' && head[2] == 'F' && head[3] == 'F'
                && head[8] == 'W' && head[9] == 'E' && head[10] == 'B' && head[11] == 'P';
        return jpeg || png || webp;
    }

    private static String normalizeContentType(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            return "image/jpeg";
        }
        return contentType.toLowerCase(Locale.ROOT).split(";")[0].trim();
    }

    private String extensionForContentType(String normalized) {
        return switch (normalized) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/jpeg", "image/jpg" -> "jpg";
            default -> {
                log.warn("Unsupported profile picture content type: {}", normalized);
                logger.warn("Unsupported profile picture content type: %s".formatted(normalized));
                throw new ProfilePictureUploadException("Only JPEG, PNG and WebP images are allowed");
            }
        };
    }

    private static String canonicalContentType(String normalized) {
        return "image/jpg".equals(normalized) ? "image/jpeg" : normalized;
    }

    private static boolean isAllowedImageContentType(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            return false;
        }
        String normalized = contentType.toLowerCase(Locale.ROOT).split(";")[0].trim();
        return switch (normalized) {
            case "image/jpeg", "image/jpg", "image/png", "image/webp" -> true;
            default -> false;
        };
    }

    private void validateBlobNameForUser(Long userId, String blobName) {
        String prefix = "user-" + userId + "-";
        if (!StringUtils.hasText(blobName)
                || !blobName.startsWith(prefix)
                || blobName.contains("/")
                || blobName.contains("..")) {
            log.warn("Invalid blob name for user ID: {}", userId);
            logger.warn("Invalid blob name for user ID: %d".formatted(userId));
            throw new ProfilePictureUploadException("Invalid blob name for this user");
        }
        String lower = blobName.toLowerCase(Locale.ROOT);
        if (!(lower.endsWith(".jpg") || lower.endsWith(".jpeg")
                || lower.endsWith(".png") || lower.endsWith(".webp"))) {
            log.warn("Invalid profile picture file extension for user ID: {}", userId);
            logger.warn("Invalid profile picture file extension for user ID: %d".formatted(userId));
            throw new ProfilePictureUploadException("Invalid profile picture file extension");
        }
    }

    private String publicBase() {
        String base = properties.getPublicBaseUrl();
        if (!StringUtils.hasText(base)) {
            base = properties.getEndpoint() + "/" + properties.getBucket();
        }
        return base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
    }

    private String publicUrl(String key) {
        return publicBase() + "/" + key;
    }

    private String extractKey(String profilePictureUrl) {
        String prefix = publicBase() + "/";
        if (!profilePictureUrl.startsWith(prefix)) {
            return null;
        }
        String key = profilePictureUrl.substring(prefix.length());
        return key.isEmpty() || key.contains("/") || key.contains("..") ? null : key;
    }
}
