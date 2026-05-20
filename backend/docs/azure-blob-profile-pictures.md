# Profile pictures — Azurite (local) & Azure Blob (prod)

## Architecture

- **users-service** stores images in Azure Blob Storage (Azurite locally).
- DB column: `users.profile_picture_url` — public HTTP URL returned to mobile.
- Upload: `POST /api/user/me/profile-picture` (multipart field `file`), via API Gateway + JWT.

## Local development (Docker Compose)

```bash
cd backend
cp .example.env .env   # sets COMPOSE_FILE=compose.yaml:compose.dev.yaml
docker compose up -d azurite users-service api-gateway
```

| File | Role |
|------|------|
| `compose.yaml` | Core stack (no Azurite — CI/prod-like default) |
| `compose.dev.yaml` | **Local only**: Azurite + ports + Azure env for `users-service` |
| `compose.cicd.yaml` | CI healthcheck tuning |
| `compose.override.yaml` | Optional, gitignored personal tweaks |

| Service | Role |
|---------|------|
| `azurite` | Blob emulator, port **10000** (`compose.dev.yaml`) |
| `users-service` | `AZURE_STORAGE_USE_DEVELOPMENT_STORAGE=true`, proxy `http://azurite:10000` |

Mobile / simulator must load images from **`http://127.0.0.1:10000/devstoreaccount1/profile-pictures/...`**  
(configured via `AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT` in compose).

**Physical phone:** set `AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT=http://<YOUR_LAN_IP>:10000/devstoreaccount1` and expose port 10000.

## Local development (JVM only)

1. Start Azurite: `docker compose up -d azurite`
2. In `.env` or environment:

```properties
AZURE_STORAGE_USE_DEVELOPMENT_STORAGE=true
AZURE_STORAGE_DEVELOPMENT_STORAGE_PROXY_URI=http://127.0.0.1:10000
AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT=http://127.0.0.1:10000/devstoreaccount1
AZURE_STORAGE_PUBLIC_READ_ACCESS=true
```

3. Run users-service on port 8081.

## Why `use-development-storage`?

The Azurite account key contains `+` characters. Putting that key inside a connection string in Docker env vars often corrupts it (spaces instead of `+`), which breaks HMAC signing.

`UseDevelopmentStorage=true;DevelopmentStorageProxyUri=...` avoids embedding the key in configuration.

## Production Azure

Set in secrets (not in git):

```properties
AZURE_STORAGE_USE_DEVELOPMENT_STORAGE=false
AZURE_STORAGE_CONNECTION_STRING=<from Azure Portal>
AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT=https://<account>.blob.core.windows.net
AZURE_STORAGE_PUBLIC_READ_ACCESS=false   # prefer SAS or CDN
```

Enable public blob access only for dev; production should use **SAS URLs** or a **proxy endpoint** in users-service.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| USER_009 on upload | Check Azurite is running; `docker logs kaucjapp-azurite` |
| Upload OK, white avatar in app | `public-read-access=true`; URL must use `127.0.0.1` on iOS simulator, not `azurite` hostname |
| `base64Key` invalid | Do not use raw account key in connection string env; use `use-development-storage` |

Test image URL in browser: open `profile_picture_url` from API response.
