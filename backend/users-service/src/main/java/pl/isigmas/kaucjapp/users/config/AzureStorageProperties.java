package pl.isigmas.kaucjapp.users.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "azure.storage")
public class AzureStorageProperties {

    /**
     * Azurite / Azure Blob connection string.
     */
    private String connectionString;

    private String containerName = "profile-pictures";

    /**
     * Optional public base URL for clients outside Docker (e.g. http://localhost:10000/devstoreaccount1).
     * When set, returned profile_picture_url uses this host instead of the internal blob endpoint.
     */
    private String publicBlobEndpoint;

    private long maxFileSizeBytes = 5 * 1024 * 1024;
}
