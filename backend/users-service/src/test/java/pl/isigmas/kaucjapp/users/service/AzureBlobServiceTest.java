package pl.isigmas.kaucjapp.users.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.models.BlobProperties;
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
    @Mock
    private BlobProperties blobProperties;

    private AzureBlobService azureBlobService;

    @BeforeEach
    void setUp() {
        AzureStorageProperties properties = new AzureStorageProperties();
        properties.setContainerName("profile-pictures-test");
        properties.setPublicBlobEndpoint("http://127.0.0.1:10000/devstoreaccount1");
        properties.setMaxFileSizeBytes(5 * 1024 * 1024);
        azureBlobService = new AzureBlobService(properties, blobServiceClient);
    }

    @Test
    void confirmProfilePicture_invalidBlobName_throws() {
        assertThatThrownBy(() -> azureBlobService.confirmProfilePicture(3L, "user-99-other.jpg"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("Invalid blob name");
    }

    @Test
    void confirmProfilePicture_invalidExtension_throws() {
        assertThatThrownBy(() -> azureBlobService.confirmProfilePicture(3L, "user-3-abc.gif"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("extension");
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
    void confirmProfilePicture_oversizedBlob_throws() {
        stubExistingBlob("user-3-abc.jpg");

        when(blobProperties.getBlobSize()).thenReturn(6 * 1024 * 1024L);

        assertThatThrownBy(() -> azureBlobService.confirmProfilePicture(3L, "user-3-abc.jpg"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("maximum allowed size");
    }

    @Test
    void confirmProfilePicture_wrongContentType_throws() {
        stubExistingBlob("user-3-abc.jpg");

        when(blobProperties.getBlobSize()).thenReturn(1024L);
        when(blobProperties.getContentType()).thenReturn("application/pdf");

        assertThatThrownBy(() -> azureBlobService.confirmProfilePicture(3L, "user-3-abc.jpg"))
                .isInstanceOf(ProfilePictureUploadException.class)
                .hasMessageContaining("JPEG, PNG and WebP");
    }

    @Test
    void confirmProfilePicture_jpeg_returnsPublicUrl() {
        stubExistingBlob("user-3-abc.jpg");

        when(blobProperties.getBlobSize()).thenReturn(1024L);
        when(blobProperties.getContentType()).thenReturn("image/jpeg");

        String url = azureBlobService.confirmProfilePicture(3L, "user-3-abc.jpg");

        assertThat(url).isEqualTo(
                "http://127.0.0.1:10000/devstoreaccount1/profile-pictures-test/user-3-abc.jpg");
    }

    @Test
    void confirmProfilePicture_png_returnsPublicUrl() {
        stubExistingBlob("user-3-photo.png");

        when(blobProperties.getBlobSize()).thenReturn(2048L);
        when(blobProperties.getContentType()).thenReturn("image/png");

        String url = azureBlobService.confirmProfilePicture(3L, "user-3-photo.png");

        assertThat(url).endsWith("/user-3-photo.png");
    }

    private void stubExistingBlob(String blobName) {
        when(blobServiceClient.getBlobContainerClient("profile-pictures-test")).thenReturn(containerClient);
        when(containerClient.getBlobClient(blobName)).thenReturn(blobClient);
        when(blobClient.exists()).thenReturn(true);
        when(blobClient.getProperties()).thenReturn(blobProperties);
    }
}
