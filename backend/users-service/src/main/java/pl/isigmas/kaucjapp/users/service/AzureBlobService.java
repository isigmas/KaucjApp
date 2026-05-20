package pl.isigmas.kaucjapp.users.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
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
            "image/png",
            "image/webp"
    );

    private final BlobServiceClient blobServiceClient;
    private final AzureStorageProperties properties;

    public AzureBlobService(AzureStorageProperties properties) {
        if (!StringUtils.hasText(properties.getConnectionString())) {
            throw new IllegalStateException("azure.storage.connection-string must be configured");
        }
        this.properties = properties;
        this.blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(properties.getConnectionString())
                .buildClient();
    }

    public String uploadProfilePicture(Long userId, MultipartFile file) throws IOException {
        validateFile(file);

        BlobContainerClient containerClient = blobServiceClient
                .getBlobContainerClient(properties.getContainerName());

        if (!containerClient.exists()) {
            containerClient.create();
        }

        String extension = resolveExtension(file);
        String blobName = "user-" + userId + "-" + UUID.randomUUID() + extension;
        BlobClient blobClient = containerClient.getBlobClient(blobName);

        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        BlobHttpHeaders headers = new BlobHttpHeaders().setContentType(contentType);

        log.info("Uploading profile picture to blob storage: {}", blobName);
        blobClient.upload(file.getInputStream(), file.getSize(), true);
        blobClient.setHttpHeaders(headers);

        return buildPublicUrl(blobName, blobClient);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ProfilePictureUploadException("Profile picture file is required");
        }
        if (file.getSize() > properties.getMaxFileSizeBytes()) {
            throw new ProfilePictureUploadException("Profile picture exceeds maximum allowed size");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ProfilePictureUploadException("Only JPEG, PNG and WebP images are allowed");
        }
    }

    private String resolveExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0 && dotIndex < originalFilename.length() - 1) {
                return originalFilename.substring(dotIndex).toLowerCase(Locale.ROOT);
            }
        }
        return switch (file.getContentType()) {
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
