package pl.isigmas.kaucjapp.users.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.options.BlobContainerCreateOptions;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.models.BlobStorageException;
import com.azure.storage.blob.models.PublicAccessType;
import com.azure.storage.common.StorageSharedKeyCredential;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import pl.isigmas.kaucjapp.users.config.AzureStorageProperties;
import pl.isigmas.kaucjapp.users.exception.ProfilePictureUploadException;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class AzureBlobService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private final BlobServiceClient blobServiceClient;
    private final AzureStorageProperties properties;

    public AzureBlobService(AzureStorageProperties properties) {
        this.properties = properties;
        this.blobServiceClient = buildBlobServiceClient(properties);
        log.info(
                "Azure Blob configured: endpoint={}, account={}, keyLength={}",
                properties.getBlobEndpoint(),
                properties.getAccountName(),
                properties.getAccountKey() != null ? properties.getAccountKey().length() : 0
        );
    }

    private static BlobServiceClient buildBlobServiceClient(AzureStorageProperties properties) {
        // 1. ZMIEŃ KOLEJNOŚĆ: Najpierw sprawdzamy Connection String (idealne dla Azurite lokalnie)
        if (StringUtils.hasText(properties.getConnectionString())) {
            return new BlobServiceClientBuilder()
                    .connectionString(properties.getConnectionString())
                    .buildClient();
        }

        // 2. Fallback na ręczne budowanie (dla prawdziwej chmury na produkcji)
        if (StringUtils.hasText(properties.getBlobEndpoint())
                && StringUtils.hasText(properties.getAccountName())
                && StringUtils.hasText(properties.getAccountKey())) {
            String accountKey = normalizeStorageAccountKey(properties.getAccountKey());
            StorageSharedKeyCredential credential = new StorageSharedKeyCredential(
                    properties.getAccountName(),
                    accountKey
            );
            return new BlobServiceClientBuilder()
                    .endpoint(properties.getBlobEndpoint())
                    .credential(credential)
                    .buildClient();
        }

        throw new IllegalStateException(
                "Configure azure.storage.blob-endpoint + account-name + account-key, or azure.storage.connection-string");
    }

    /**
     * Connection strings and some env loaders turn '+' in the Azurite account key into spaces.
     */
    private static String normalizeStorageAccountKey(String accountKey) {
        String trimmed = accountKey.trim();
        if (trimmed.indexOf(' ') >= 0 && trimmed.indexOf('+') < 0) {
            return trimmed.replace(' ', '+');
        }
        return trimmed;
    }

    public String uploadProfilePicture(Long userId, MultipartFile file) throws IOException {
        validateFile(file);

        BlobContainerClient containerClient = blobServiceClient
                .getBlobContainerClient(properties.getContainerName());

        try {
            ensureContainerExists(containerClient);
        } catch (RuntimeException e) {
            log.error("Failed to access blob container {}", properties.getContainerName(), e);
            throw ProfilePictureUploadException.storageFailed();
        }

        String extension = resolveExtension(file);
        String blobName = "user-" + userId + "-" + UUID.randomUUID() + extension;
        BlobClient blobClient = containerClient.getBlobClient(blobName);

        String contentType = resolveContentType(file);
        BlobHttpHeaders headers = new BlobHttpHeaders().setContentType(contentType);

        log.info("Uploading profile picture to blob storage: {}", blobName);
        try {
            blobClient.upload(file.getInputStream(), file.getSize(), true);
            blobClient.setHttpHeaders(headers);
        } catch (BlobStorageException e) {
            log.error("Azure blob upload failed for {}", blobName, e);
            throw ProfilePictureUploadException.storageFailed();
        }

        return buildPublicUrl(blobName, blobClient);
    }

    private void ensureContainerExists(BlobContainerClient containerClient) {
        BlobContainerCreateOptions createOptions = new BlobContainerCreateOptions();
        if (properties.isPublicReadAccess()) {
            createOptions.setPublicAccessType(PublicAccessType.BLOB);
        }
        containerClient.createIfNotExistsWithResponse(createOptions, null, null);
        if (properties.isPublicReadAccess() && containerClient.exists()) {
            containerClient.setAccessPolicy(PublicAccessType.BLOB, null);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ProfilePictureUploadException("Profile picture file is required");
        }
        if (file.getSize() > properties.getMaxFileSizeBytes()) {
            throw new ProfilePictureUploadException("Profile picture exceeds maximum allowed size");
        }
        String contentType = resolveContentType(file);
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ProfilePictureUploadException("Only JPEG, PNG and WebP images are allowed");
        }
    }

    private String resolveContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null) {
            String normalized = contentType.toLowerCase(Locale.ROOT);
            if ("image/jpg".equals(normalized)) {
                return "image/jpeg";
            }
            if (ALLOWED_CONTENT_TYPES.contains(normalized)) {
                return normalized;
            }
        }
        return switch (resolveExtension(file)) {
            case ".png" -> "image/png";
            case ".webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }

    private String resolveExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0 && dotIndex < originalFilename.length() - 1) {
                return originalFilename.substring(dotIndex).toLowerCase(Locale.ROOT);
            }
        }
        return switch (resolveContentType(file)) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }

    private String buildPublicUrl(String blobName, BlobClient blobClient) {
        String publicBase = properties.getPublicBlobEndpoint();
        if (StringUtils.hasText(publicBase)) {
            String base = publicBase.endsWith("/") ? publicBase.substring(0, publicBase.length() - 1) : publicBase;
            return base + "/" + properties.getContainerName() + "/" + blobName;
        }
        return blobClient.getBlobUrl();
    }
}
