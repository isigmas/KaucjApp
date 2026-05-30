package pl.isigmas.kaucjapp.users.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.models.BlobProperties;
import com.azure.storage.blob.models.BlobStorageException;
import com.azure.storage.blob.models.PublicAccessType;
import com.azure.storage.blob.options.BlobContainerCreateOptions;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.UploadUrlDTO;
import pl.isigmas.kaucjapp.users.config.AzureStorageProperties;
import pl.isigmas.kaucjapp.users.exception.ProfilePictureUploadException;

import java.net.URI;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
public class AzureBlobService {

    private final BlobServiceClient blobServiceClient;
    private final AzureStorageProperties properties;
    private final Logger logger;

    public AzureBlobService(
            AzureStorageProperties properties,
            BlobServiceClient blobServiceClient,
            Logger logger
    ) {
        this.properties = properties;
        this.blobServiceClient = blobServiceClient;
        this.logger = logger;
        logger.info(
                "Azure Blob ready: mode=%s, container=%s, publicRead=%s, publicBase=%s"
                        .formatted(
                                properties.isUseDevelopmentStorage() ? "azurite" : "azure",
                                properties.getContainerName(),
                                properties.isPublicReadAccess(),
                                properties.getPublicBlobEndpoint()
                        )
        );
    }

    public UploadUrlDTO generateUploadUrl(Long userId, String contentType) {
        String normalized = normalizeContentType(contentType);
        String extension = extensionForContentType(normalized);
        String blobName = "user-" + userId + "-" + UUID.randomUUID() + "." + extension;

        BlobContainerClient container = blobServiceClient
                .getBlobContainerClient(properties.getContainerName());
        ensureContainerReady(container);

        BlobClient blobClient = container.getBlobClient(blobName);

        BlobSasPermission permission = new BlobSasPermission()
                .setWritePermission(true)
                .setCreatePermission(true);
        BlobServiceSasSignatureValues values = new BlobServiceSasSignatureValues(
                OffsetDateTime.now().plusMinutes(10), permission)
                .setContentType(blobContentType(normalized));

        String sasToken = blobClient.generateSas(values);
        String uploadUrl = buildPublicUrl(blobName) + "?" + sasToken;

        return new UploadUrlDTO(uploadUrl, blobName);
    }

    /**
     * Validates ownership, existence, size and content type of an uploaded blob,
     * then returns the public URL to store in DB.
     */
    public String confirmProfilePicture(Long userId, String blobName) {
        validateBlobNameForUser(userId, blobName);

        BlobClient blobClient = blobServiceClient
                .getBlobContainerClient(properties.getContainerName())
                .getBlobClient(blobName);

        if (!blobClient.exists()) {
            logger.warn("Profile picture upload not found for user ID: %d, blob: %s".formatted(userId, blobName));
            throw new ProfilePictureUploadException(
                    "Upload not found; PUT the image to the SAS URL before confirming");
        }

        validateUploadedBlob(blobClient);

        return buildPublicUrl(blobName);
    }

    /**
     * Best-effort removal of a previously stored profile picture URL.
     */
    public void deleteByStoredUrl(String profilePictureUrl) {
        if (!StringUtils.hasText(profilePictureUrl)) {
            return;
        }
        String blobName = extractBlobName(profilePictureUrl);
        if (blobName == null) {
            log.debug("Skipping blob delete, URL does not match container {}: {}", properties.getContainerName(), profilePictureUrl);
            return;
        }
        try {
            BlobContainerClient container = blobServiceClient.getBlobContainerClient(properties.getContainerName());
            boolean deleted = container.getBlobClient(blobName).deleteIfExists();
            if (deleted) {
                logger.info("Deleted old profile picture blob: %s".formatted(blobName));
            }
        } catch (BlobStorageException e) {
            logger.warn("Could not delete old profile picture %s: %s".formatted(blobName, e.getMessage()));
        }
    }

    private void validateUploadedBlob(BlobClient blobClient) {
        BlobProperties blobProperties;
        try {
            blobProperties = blobClient.getProperties();
        } catch (BlobStorageException e) {
            logger.error(
                    "Failed to read blob properties: %s %s".formatted(e.getErrorCode(), e.getMessage())
            );
            throw ProfilePictureUploadException.storageFailed();
        }

        Long size = blobProperties.getBlobSize();
        if (size == null || size <= 0 || size > properties.getMaxFileSizeBytes()) {
            logger.warn("Profile picture exceeds maximum allowed size");
            throw new ProfilePictureUploadException("Profile picture exceeds maximum allowed size");
        }

        if (!isAllowedImageContentType(blobProperties.getContentType())) {
            logger.warn("Profile picture has disallowed content type: %s".formatted(blobProperties.getContentType()));
            throw new ProfilePictureUploadException("Only JPEG, PNG and WebP images are allowed");
        }
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
                logger.warn("Unsupported profile picture content type: %s".formatted(normalized));
                throw new ProfilePictureUploadException("Only JPEG, PNG and WebP images are allowed");
            }
        };
    }

    private static String blobContentType(String normalized) {
        if ("image/jpg".equals(normalized)) {
            return "image/jpeg";
        }
        return normalized;
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
            logger.warn("Invalid blob name for user ID: %d".formatted(userId));
            throw new ProfilePictureUploadException("Invalid blob name for this user");
        }
        String lower = blobName.toLowerCase(Locale.ROOT);
        if (!(lower.endsWith(".jpg") || lower.endsWith(".jpeg")
                || lower.endsWith(".png") || lower.endsWith(".webp"))) {
            logger.warn("Invalid profile picture file extension for user ID: %d".formatted(userId));
            throw new ProfilePictureUploadException("Invalid profile picture file extension");
        }
    }

    private void ensureContainerReady(BlobContainerClient container) {
        try {
            BlobContainerCreateOptions options = new BlobContainerCreateOptions();
            if (properties.isPublicReadAccess()) {
                options.setPublicAccessType(PublicAccessType.BLOB);
            }
            container.createIfNotExistsWithResponse(options, null, null);
            if (properties.isPublicReadAccess()) {
                container.setAccessPolicy(PublicAccessType.BLOB, null);
            }
        } catch (BlobStorageException e) {
            logger.error(
                    "Failed to prepare container %s: %s %s"
                            .formatted(properties.getContainerName(), e.getErrorCode(), e.getMessage())
            );
            throw ProfilePictureUploadException.storageFailed();
        }
    }

    private String buildPublicUrl(String blobName) {
        String publicBase = properties.getPublicBlobEndpoint();
        if (StringUtils.hasText(publicBase)) {
            String base = publicBase.endsWith("/") ? publicBase.substring(0, publicBase.length() - 1) : publicBase;
            return base + "/" + properties.getContainerName() + "/" + blobName;
        }
        return blobServiceClient
                .getBlobContainerClient(properties.getContainerName())
                .getBlobClient(blobName)
                .getBlobUrl();
    }

    private String extractBlobName(String profilePictureUrl) {
        try {
            String path = URI.create(profilePictureUrl).getPath();
            if (!StringUtils.hasText(path)) {
                return null;
            }
            String marker = "/" + properties.getContainerName() + "/";
            int index = path.indexOf(marker);
            if (index < 0) {
                return null;
            }
            return path.substring(index + marker.length());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
