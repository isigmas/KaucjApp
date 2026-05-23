package pl.isigmas.kaucjapp.users.config;

import com.azure.storage.blob.BlobServiceClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

@Configuration
@EnableConfigurationProperties(AzureStorageProperties.class)
public class AzureStorageConfig {

    @Bean
    @Lazy
    public BlobServiceClient blobServiceClient(AzureStorageProperties properties) {
        return AzureBlobClientFactory.create(properties);
    }
}