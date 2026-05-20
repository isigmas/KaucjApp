package pl.isigmas.kaucjapp.users.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AzureBlobClientFactoryTest {

    @Test
    void buildAzuriteConnectionString_usesProxyUriWithoutTrailingSlash() {
        String cs = AzureBlobClientFactory.buildAzuriteConnectionString("http://azurite:10000/");
        assertThat(cs).isEqualTo("UseDevelopmentStorage=true;DevelopmentStorageProxyUri=http://azurite:10000;");
    }

    @Test
    void normalizeAccountKey_restoresPlusSigns() {
        String corrupted = "abc def==";
        assertThat(AzureBlobClientFactory.normalizeAccountKey(corrupted)).isEqualTo("abc+def==");
    }
}
