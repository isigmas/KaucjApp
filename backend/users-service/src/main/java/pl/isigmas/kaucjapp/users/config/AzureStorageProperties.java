package pl.isigmas.kaucjapp.users.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "azure.storage")
public class AzureStorageProperties {

    /**
     * Blob service endpoint, e.g. http://azurite:10000/devstoreaccount1 (Docker) or http://127.0.0.1:10000/devstoreaccount1 (local).
     */
    private String blobEndpoint;

    private String accountName = "devstoreaccount1";

    /**
     * Storage account key. Use a separate property (not a connection string) so '+' in the Azurite key is not corrupted.
     */
    private String accountKey;

    public void setAccountKey(String accountKey) {
        this.accountKey = accountKey == null ? null : accountKey.trim();
    }

    /**
     * Optional full connection string (Azure production). Prefer blob-endpoint + account-key for Azurite.
     */
    private String connectionString;

    private String containerName = "profile-pictures";

    /**
     * Optional public base URL for clients outside Docker (e.g. http://192.168.x.x:10000/devstoreaccount1).
     */
    private String publicBlobEndpoint;

    private long maxFileSizeBytes = 5 * 1024 * 1024;

    /**
     * When true, blobs are readable via anonymous GET (required for mobile Image URLs with Azurite).
     * Disable in production and serve images via SAS or a proxy instead.
     */
    private boolean publicReadAccess = true;
}
