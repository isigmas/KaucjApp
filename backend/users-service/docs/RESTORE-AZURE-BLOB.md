# Przywracanie Azure Blob (zdjęcia profilowe) w users-service

Usunięto tymczasowo, żeby native build (`Dockerfile.native`) zmieścił się w pamięci ACR Basic.
Endpointy profilowe zostają jako **501 Not Implemented** do czasu przywrócenia.

**Ostatni commit z pełną implementacją (przed usunięciem):** `f1f68dbd102e66ba658f2bc01e2fcd3a9a21bb9f`

---

## Szybkie przywrócenie z gita

Z katalogu repo:

```bash
# Przywróć wszystkie pliki blob z ostatniego commita z implementacją
git checkout f1f68dbd -- \
  backend/users-service/pom.xml \
  backend/users-service/src/main/java/pl/isigmas/kaucjapp/users/service/AzureBlobService.java \
  backend/users-service/src/main/java/pl/isigmas/kaucjapp/users/config/AzureStorageConfig.java \
  backend/users-service/src/main/java/pl/isigmas/kaucjapp/users/config/AzureBlobClientFactory.java \
  backend/users-service/src/main/java/pl/isigmas/kaucjapp/users/config/AzureStorageProperties.java \
  backend/users-service/src/test/java/pl/isigmas/kaucjapp/users/service/AzureBlobServiceTest.java \
  backend/users-service/src/test/java/pl/isigmas/kaucjapp/users/config/AzureBlobClientFactoryTest.java \
  backend/users-service/src/main/resources/application.properties \
  backend/users-service/src/main/resources/META-INF/native-image/pl.isigmas/users-service/native-image.properties \
  backend/users-service/src/main/java/pl/isigmas/kaucjapp/users/controller/UserController.java \
  backend/users-service/src/test/java/pl/isigmas/kaucjapp/users/integration/profile/UserProfileEndpointTest.java
```

Potem ręcznie przywróć env w `infra/main.bicep` i `backend/compose.yaml` (patrz sekcje poniżej).

---

## Pliki do przywrócenia (ścieżki)

| Plik | Rola |
|------|------|
| `src/main/java/.../service/AzureBlobService.java` | SAS URL, confirm, delete blob |
| `src/main/java/.../config/AzureStorageConfig.java` | Bean `BlobServiceClient` |
| `src/main/java/.../config/AzureBlobClientFactory.java` | Azurite / Azure connection |
| `src/main/java/.../config/AzureStorageProperties.java` | `@ConfigurationProperties` |
| `src/test/java/.../service/AzureBlobServiceTest.java` | Testy jednostkowe |
| `src/test/java/.../config/AzureBlobClientFactoryTest.java` | Test factory |

**Zostawione w kodzie (nie usuwać przy restore):**

| Plik | Rola |
|------|------|
| `src/main/java/.../DTO/UploadUrlDTO.java` | `upload_url`, `blob_name` |
| `src/main/java/.../DTO/ConfirmUploadDTO.java` | `blob_name` w confirm |
| `src/main/java/.../exception/ProfilePictureUploadException.java` | `USER_008`, `USER_009` |

---

## `pom.xml` — dependency

```xml
<dependency>
    <groupId>com.azure</groupId>
    <artifactId>azure-storage-blob</artifactId>
    <version>12.25.1</version>
</dependency>
```

## `pom.xml` — `native-maven-plugin` buildArgs

```xml
<buildArgs combine.children="append">
    <buildArg>--initialize-at-build-time=com.fasterxml.jackson.core,org.slf4j,ch.qos.logback,com.azure.core.util.logging</buildArg>
    <buildArg>--initialize-at-run-time=com.fasterxml.jackson.dataformat.xml.util.StaxUtil$Base64Mapper</buildArg>
    <buildArg>--initialize-at-run-time=org.codehaus.stax2.typed.Base64Variants</buildArg>
    <buildArg>--initialize-at-run-time=io.netty,com.azure.core.http.netty</buildArg>
    <buildArg>-march=compatibility</buildArg>
</buildArgs>
```

## `META-INF/native-image/.../native-image.properties`

```
# Azure Storage pulls jackson-dataformat-xml; GraalVM 25 needs explicit init (see Azure SDK native-image docs).
Args = \
  --initialize-at-build-time=com.fasterxml.jackson.core,org.slf4j,ch.qos.logback,com.azure.core.util.logging \
  --initialize-at-run-time=com.fasterxml.jackson.dataformat.xml.util.StaxUtil$Base64Mapper \
  --initialize-at-run-time=org.codehaus.stax2.typed.Base64Variants
```

## `application.properties`

```properties
# Azure Blob — only host URLs from env; rest has defaults (override in application-test.properties)
azure.storage.enabled=${AZURE_STORAGE_ENABLED:false}
azure.storage.use-development-storage=true
azure.storage.development-storage-proxy-uri=${AZURE_STORAGE_DEVELOPMENT_STORAGE_PROXY_URI:}
azure.storage.connection-string=${AZURE_STORAGE_CONNECTION_STRING:}
azure.storage.blob-endpoint=${AZURE_STORAGE_BLOB_ENDPOINT:}
azure.storage.account-name=${AZURE_STORAGE_ACCOUNT_NAME:}
azure.storage.account-key=${AZURE_STORAGE_ACCOUNT_KEY:}
azure.storage.container-name=profile-pictures
azure.storage.public-blob-endpoint=${AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT:}
azure.storage.public-read-access=true
azure.storage.max-file-size-bytes=5242880
```

## `application-test.properties` (testy integracyjne)

```properties
azure.storage.use-development-storage=true
azure.storage.development-storage-proxy-uri=http://127.0.0.1:10000
azure.storage.container-name=profile-pictures-test
azure.storage.public-blob-endpoint=http://127.0.0.1:10000/devstoreaccount1
azure.storage.public-read-access=true
```

Przy restore ustaw też `azure.storage.enabled=true` w testach, jeśli używasz `@ConditionalOnProperty`.

---

## `UserController.java`

1. Import: `pl.isigmas.kaucjapp.users.service.AzureBlobService`
2. Pole: `private final AzureBlobService azureBlobService;`
3. Zamień 501 na oryginalne implementacje:

### `GET /api/user/me/profile-picture/upload-url`

```java
public ResponseEntity<UploadUrlDTO> getUploadUrl(
        @RequestHeader("X-User-Id") Long currentUserId,
        @RequestParam(value = "content_type", required = false, defaultValue = "image/jpeg") String contentType) {
    log.info("Getting upload url for profile picture for user {}", currentUserId);
    logger.info("Getting upload url for profile picture for user %d".formatted(currentUserId));
    UploadUrlDTO dto = azureBlobService.generateUploadUrl(currentUserId, contentType);
    return ResponseEntity.ok(dto);
}
```

### `POST /api/user/me/profile-picture/confirm`

```java
public ResponseEntity<UserDTO> confirmUpload(
        @RequestHeader("X-User-Id") Long currentUserId,
        @Valid @RequestBody ConfirmUploadDTO dto) {
    log.info("Confirming upload of profile picture for user {}", currentUserId);
    logger.info("Confirming upload of profile picture for user %d".formatted(currentUserId));
    UserDTO current = userService.getUserById(currentUserId);
    String publicUrl = azureBlobService.confirmProfilePicture(currentUserId, dto.blobName());
    UserDTO updated = userService.updateProfilePictureUrl(currentUserId, publicUrl);
    azureBlobService.deleteByStoredUrl(current.getProfilePictureUrl());
    return ResponseEntity.ok(updated);
}
```

### `DELETE /api/user/me/profile-picture`

```java
public ResponseEntity<Void> deleteProfilePicture(
        @RequestHeader("X-User-Id") Long currentUserId) {
    log.info("Deleting profile picture for user {}", currentUserId);
    logger.info("Deleting profile picture for user %d".formatted(currentUserId));
    UserDTO current = userService.getUserById(currentUserId);
    userService.clearProfilePicture(currentUserId);
    azureBlobService.deleteByStoredUrl(current.getProfilePictureUrl());
    return ResponseEntity.noContent().build();
}
```

---

## `infra/main.bicep` — env users-service

W sekcji `usersApp` → `envVars` dodaj (secret `storage-conn` już jest w `appSecrets`):

```bicep
{ name: 'AZURE_STORAGE_ENABLED', value: 'true' }
{ name: 'AZURE_STORAGE_USE_DEVELOPMENT_STORAGE', value: 'false' }
{ name: 'AZURE_STORAGE_CONNECTION_STRING', secretRef: 'storage-conn' }
{ name: 'AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT', value: storage.outputs.blobEndpoint }
{ name: 'AZURE_STORAGE_CONTAINER_NAME', value: 'profile-pictures' }
{ name: 'AZURE_STORAGE_PUBLIC_READ_ACCESS', value: 'true' }
```

Moduł `storage` (`modules/storage.bicep`) zostaje w infra — nie usuwaj go.

---

## `backend/compose.yaml` — users-service + Azurite

W `users-service.environment`:

```yaml
- AZURE_STORAGE_ENABLED=true
- AZURE_STORAGE_USE_DEVELOPMENT_STORAGE=true
- AZURE_STORAGE_DEVELOPMENT_STORAGE_PROXY_URI=http://azurite:10000
- AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT=${AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT:-http://127.0.0.1:10000/devstoreaccount1}
- AZURE_STORAGE_CONTAINER_NAME=profile-pictures
- AZURE_STORAGE_PUBLIC_READ_ACCESS=true
```

Serwis `azurite` w compose zostaje (port 10000). Przywróć też w `depends_on` users-service:

```yaml
azurite:
  condition: service_started
```

---

## Test integracyjny `UserProfileEndpointTest`

Przywróć testy `deleteProfilePicture_clearsUrl` i `deleteProfilePicture_withoutPicture_isIdempotent`
(oczekują `204 No Content`, nie `501`). Z commita `f1f68dbd`.

---

## Flow uploadu (dla mobile / klienta)

1. `GET /api/user/me/profile-picture/upload-url?content_type=image/jpeg` + `X-User-Id`
2. Klient robi `PUT` na `upload_url` z nagłówkami `Content-Type`, `x-ms-blob-type: BlockBlob`
3. `POST /api/user/me/profile-picture/confirm` z body `{"blob_name":"user-123-....jpg"}`
4. `DELETE /api/user/me/profile-picture` — czyści DB + blob

---

## Native build — uwagi po przywróceniu

- Azure SDK + Netty znacząco zwiększają RAM przy `native-image` (~43 min, OOM na ACR Basic).
- Opcje jeśli znowu OOM:
  - ACR **Premium** (więcej RAM na agencie build)
  - Tymczasowo **JVM** (`users-service/Dockerfile`) tylko dla users
  - Zostaw blob wyłączony na Azure (`AZURE_STORAGE_ENABLED=false`), włącz tylko lokalnie

---

## Deploy po przywróceniu

```bash
cd infra
azd deploy users-service --timeout 3600 --no-prompt
# po timeout logów (~19 min) sprawdź ACR:
az acr task list-runs --registry kaucjappdev2026 --top 3 -o table
# jak Succeeded:
azd deploy users-service --from-package "kaucjappdev2026.azurecr.io/kaucjapp-microservices/users-service-dev:<tag>" --no-prompt
```
