package pl.isigmas.kaucjapp.users.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.users.config.AzureStorageProperties;
import pl.isigmas.kaucjapp.users.exception.ProfilePictureUploadException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AzureBlobServiceTest {

    @Mock
    private BlobServiceClient blobServiceClient;
    @Mock
    private BlobContainerClient containerClient;
    @Mock
    private BlobClient blobClient;

    private AzureBlobService azureBlobService;

    @BeforeEach
    void setUp() {
        AzureStorageProperties properties = new AzureStorageProperties();
        properties.setContainerName("profile-pictures-test");
        properties.setPublicBlobEndpoint("http://127.0.0.1:10000/devstoreaccount1");
        azureBlobService = new AzureBlobService(properties, blobServiceClient);
    }

    @Test
    void confirmProfilePicture_invalidBlobName_throws() {
        assertThatThrownBy(() -> azureBlobService.confirmProfilePicture(3L, "user-99-other.jpg"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("Invalid blob name");
    }

    @Test
    void confirmProfilePicture_missingBlob_throws() {
        when(blobServiceClient.getBlobContainerClient("profile-pictures-test")).thenReturn(containerClient);
        when(containerClient.getBlobClient("user-3-abc.jpg")).thenReturn(blobClient);
        when(blobClient.exists()).thenReturn(false);

        assertThatThrownBy(() -> azureBlobService.confirmProfilePicture(3L, "user-3-abc.jpg"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("Upload not found");
    }

    @Test
    void confirmProfilePicture_existingBlob_returnsPublicUrl() {
        when(blobServiceClient.getBlobContainerClient("profile-pictures-test")).thenReturn(containerClient);
        when(containerClient.getBlobClient("user-3-abc.jpg")).thenReturn(blobClient);
        when(blobClient.exists()).thenReturn(true);

        String url = azureBlobService.confirmProfilePicture(3L, "user-3-abc.jpg");

        assertThat(url).isEqualTo(
                "http://127.0.0.1:10000/devstoreaccount1/profile-pictures-test/user-3-abc.jpg");
    }
}
