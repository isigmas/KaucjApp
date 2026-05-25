package pl.isigmas.kaucjapp.users.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "azure.storage")
public class AzureStorageProperties {

    /**
     * When true, connects via {@code UseDevelopmentStorage=true} (Azurite emulator).
     * Avoids embedding the well-known account key in env vars where '+' may be corrupted.
     */
    private boolean useDevelopmentStorage = false;

    /**
     * Azurite proxy host reachable from users-service.
     * {@code compose.yaml} hardcodes {@code http://azurite:10000} in Docker; host JVM uses {@code .env} ({@code 127.0.0.1}).
     */
    private String developmentStorageProxyUri;

    /**
     * Azure Storage connection string (production). Ignored when {@link #useDevelopmentStorage} is true.
     */
    private String connectionString;

    /**
     * Alternative to connection string: blob endpoint + account credentials.
     */
    private String blobEndpoint;

    private String accountName;

    private String accountKey;

    public void setAccountKey(String accountKey) {
        this.accountKey = accountKey == null ? null : accountKey.trim();
    }

    private String containerName = "profile-pictures";

    /**
     * Base URL returned to clients, e.g. {@code http://127.0.0.1:10000/devstoreaccount1}.
     * Must be reachable from the device — not the internal Docker hostname {@code azurite}.
     */
    private String publicBlobEndpoint;

    private long maxFileSizeBytes = 5 * 1024 * 1024;

    /**
     * Anonymous read on container (required for {@code <Image uri>} without SAS).
     * Keep {@code true} for local Azurite; set {@code false} on production Azure and use SAS/CDN.
     */
    private boolean publicReadAccess = false;
}
