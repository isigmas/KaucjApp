package pl.isigmas.kaucjapp.users.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(AzureStorageProperties.class)
public class AzureStorageConfig {
}
