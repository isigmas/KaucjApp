package pl.isigmas.kaucjapp.users.config;

import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.common.StorageSharedKeyCredential;
import org.springframework.util.StringUtils;

/**
 * Builds {@link BlobServiceClient} for Azurite (dev) or Azure Storage (prod).
 */
public final class AzureBlobClientFactory {

    private static final String AZURITE_ACCOUNT_NAME = "devstoreaccount1";

    private AzureBlobClientFactory() {
    }

    public static BlobServiceClient create(AzureStorageProperties properties) {
        if (properties.isUseDevelopmentStorage()) {
            return createForAzurite(properties.getDevelopmentStorageProxyUri());
        }
        if (StringUtils.hasText(properties.getConnectionString())) {
            return new BlobServiceClientBuilder()
                    .connectionString(properties.getConnectionString().trim())
                    .buildClient();
        }
        if (StringUtils.hasText(properties.getBlobEndpoint())
                && StringUtils.hasText(properties.getAccountName())
                && StringUtils.hasText(properties.getAccountKey())) {
            StorageSharedKeyCredential credential = new StorageSharedKeyCredential(
                    properties.getAccountName(),
                    normalizeAccountKey(properties.getAccountKey())
            );
            return new BlobServiceClientBuilder()
                    .endpoint(normalizeEndpoint(properties.getBlobEndpoint()))
                    .credential(credential)
                    .buildClient();
        }
        throw new IllegalStateException(
                "Azure Storage is not configured. Set azure.storage.use-development-storage=true "
                        + "(Azurite), or azure.storage.connection-string, "
                        + "or azure.storage.blob-endpoint + account-name + account-key.");
    }

    static String buildAzuriteConnectionString(String proxyUri) {
        String base = normalizeProxyUri(proxyUri);
        return "UseDevelopmentStorage=true;DevelopmentStorageProxyUri=" + base + ";";
    }

    private static BlobServiceClient createForAzurite(String proxyUri) {
        String connectionString = buildAzuriteConnectionString(proxyUri);
        return new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();
    }

    private static String normalizeProxyUri(String proxyUri) {
        if (!StringUtils.hasText(proxyUri)) {
            return "http://127.0.0.1:10000";
        }
        String trimmed = proxyUri.trim();
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    private static String normalizeEndpoint(String endpoint) {
        String trimmed = endpoint.trim();
        if (!trimmed.contains("/" + AZURITE_ACCOUNT_NAME)
                && trimmed.matches("https?://[^/]+")) {
            return trimmed + "/" + AZURITE_ACCOUNT_NAME;
        }
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    /**
     * Env loaders and connection-string parsers sometimes turn '+' in the Azurite key into spaces.
     */
    static String normalizeAccountKey(String accountKey) {
        String trimmed = accountKey.trim();
        if (trimmed.indexOf(' ') >= 0 && trimmed.indexOf('+') < 0) {
            return trimmed.replace(' ', '+');
        }
        return trimmed;
    }
}
