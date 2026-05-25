package pl.isigmas.kaucjapp.users.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.models.BlobStorageException;
import com.azure.storage.blob.models.PublicAccessType;
import com.azure.storage.blob.options.BlobContainerCreateOptions;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import pl.isigmas.kaucjapp.users.DTO.UploadUrlDTO;
import pl.isigmas.kaucjapp.users.config.AzureStorageProperties;
import pl.isigmas.kaucjapp.users.exception.ProfilePictureUploadException;

import java.io.IOException;
import java.net.URI;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Map;
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

    public AzureBlobService(AzureStorageProperties properties,  BlobServiceClient blobServiceClient) {
        this.properties = properties;
        this.blobServiceClient = blobServiceClient;
        log.info(
                "Azure Blob ready: mode={}, container={}, publicRead={}, publicBase={}",
                properties.isUseDevelopmentStorage() ? "azurite" : "azure",
                properties.getContainerName(),
                properties.isPublicReadAccess(),
                properties.getPublicBlobEndpoint()
        );
    }

    public UploadUrlDTO generateUploadUrl(Long userId) {
        String blobName = "user-" + userId + "-" + UUID.randomUUID() + ".jpg";

        BlobContainerClient container = blobServiceClient
                .getBlobContainerClient(properties.getContainerName());
        ensureContainerReady(container);

        BlobClient blobClient = container.getBlobClient(blobName);

        BlobSasPermission permission = new BlobSasPermission()
                .setWritePermission(true)
                .setCreatePermission(true);
        BlobServiceSasSignatureValues values = new BlobServiceSasSignatureValues(
                OffsetDateTime.now().plusMinutes(10), permission)
                .setContentType("image/jpeg");

        String sasToken = blobClient.generateSas(values);
        String uploadUrl = buildPublicUrl(blobName) + "?" + sasToken;

        return new UploadUrlDTO(uploadUrl, blobName);
    }

    /**
     * Validates ownership and existence of an uploaded blob, then returns the public URL to store in DB.
     */
    public String confirmProfilePicture(Long userId, String blobName) {
        validateBlobNameForUser(userId, blobName);

        BlobClient blobClient = blobServiceClient
                .getBlobContainerClient(properties.getContainerName())
                .getBlobClient(blobName);

        if (!blobClient.exists()) {
            throw new ProfilePictureUploadException(
                    "Upload not found; PUT the image to the SAS URL before confirming");
        }

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
                log.info("Deleted old profile picture blob: {}", blobName);
            }
        } catch (BlobStorageException e) {
            log.warn("Could not delete old profile picture {}: {}", blobName, e.getMessage());
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
            log.error("Failed to prepare container {}: {} {}", properties.getContainerName(), e.getErrorCode(), e.getMessage());
            throw ProfilePictureUploadException.storageFailed();
        }
    }

    private void validateFile(MultipartFile file)  throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ProfilePictureUploadException("Profile picture file is required");
        }
        if (file.getSize() > properties.getMaxFileSizeBytes()) {
            throw new ProfilePictureUploadException("Profile picture exceeds maximum allowed size");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(resolveContentType(file))) {
            throw new ProfilePictureUploadException("Only JPEG, PNG and WebP images are allowed");
        }
        validateMagicBytes(file);
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

    private void validateBlobNameForUser(Long userId, String blobName) {
        String prefix = "user-" + userId + "-";
        if (!StringUtils.hasText(blobName)
                || !blobName.startsWith(prefix)
                || blobName.contains("/")
                || blobName.contains("..")) {
            throw new ProfilePictureUploadException("Invalid blob name for this user");
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

    private static final Map<String, byte[]> MAGIC_BYTES = Map.of(
            "image/jpeg", new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF},
            "image/png",  new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47},
            "image/webp", new byte[]{0x52, 0x49, 0x46, 0x46}
    );

    private void validateMagicBytes(MultipartFile file) throws IOException {
        byte[] header = new byte[4];
        try (var is = file.getInputStream()) {
            int read = is.read(header);
            if (read < 3) {
                throw new ProfilePictureUploadException("File is too small to be a valid image");
            }
        }
        String declaredType = resolveContentType(file);
        byte[] expected = MAGIC_BYTES.get(declaredType);
        if (expected == null) {
            throw new ProfilePictureUploadException("Only JPEG, PNG and WebP images are allowed");
        }
        for (int i = 0; i < expected.length; i++) {
            if (header[i] != expected[i]) {
                throw new ProfilePictureUploadException("File content does not match declared image type");
            }
        }
    }
}
