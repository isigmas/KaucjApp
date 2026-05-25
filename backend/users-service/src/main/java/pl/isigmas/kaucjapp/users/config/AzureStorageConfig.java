package pl.isigmas.kaucjapp.users.config;

import com.azure.storage.blob.BlobServiceClient;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.util.StringUtils;

@Configuration
@EnableConfigurationProperties(AzureStorageProperties.class)
public class AzureStorageConfig {

    @PostConstruct
    void validateAzureStorage(AzureStorageProperties properties) {
        if (!StringUtils.hasText(properties.getPublicBlobEndpoint())) {
            throw new IllegalStateException(
                    "AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT is required (URL reachable from mobile/browser). "
                            + "Copy backend/.example.env to backend/.env and adjust for your setup.");
        }
        if (properties.isUseDevelopmentStorage()
                && !StringUtils.hasText(properties.getDevelopmentStorageProxyUri())) {
            throw new IllegalStateException(
                    "AZURE_STORAGE_DEVELOPMENT_STORAGE_PROXY_URI is required when "
                            + "AZURE_STORAGE_USE_DEVELOPMENT_STORAGE=true.");
        }
    }

    @Bean
    @Lazy
    public BlobServiceClient blobServiceClient(AzureStorageProperties properties) {
        return AzureBlobClientFactory.create(properties);
    }
}