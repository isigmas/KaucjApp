# KaucjApp production deployment (single VPS)

One VPS runs everything with Docker Compose: Caddy (HTTPS) → gql-gateway → the services, plus one Postgres,
one Kafka (KRaft) and one Redis. Images are built by GitHub Actions and pulled from GHCR. Nothing is built on the server.

```
GitHub push to main
  └─ Build backend images ──► ghcr.io/<owner>/kaucjapp-<service>:<sha>
        └─ Deploy ──► rsync deploy/ + .env ──► scripts/deploy.sh ──► smoke test ──► mark good / roll back
```

| Path | Purpose |
|------|---------|
| `compose.prod.yaml`, `Caddyfile` | The stack (RAM limits, health checks, pinned versions) |
| `postgres/init`, `kafka/topics.txt` | One database per service; Kafka topics (the list is also used by the dev stack) |
| `cloud-init.yaml`, `scripts/bootstrap.sh` | Hardened server in one go (SSH key only, ufw, fail2ban, auto-updates, Docker, swap, backup timers) |
| `scripts/deploy.sh` | Pull → start → health check → rollback to the last good tag |
| `scripts/backup.sh`, `scripts/restore.sh` | Nightly `pg_dump` of all databases to R2; restore and monthly restore drill |
| `scripts/smoke-test.sh` | End-to-end check through the public URL (also used in CI) |
| `CUTOVER.md` | Dry run of the branch and switching from Azure (no data migration needed) |

## One-time setup

### 1. The server
Any provider works (the stack needs ≥ 4 GB RAM, 2 vCPU, Ubuntu 24.04 or Debian 12, a public IPv4). Cheap options as of 2026:
OVH VPS (Warsaw), Hetzner Cloud CX/CAX (when in stock), Contabo Cloud VPS. Choose a data centre close to the users (Poland).

1. Create an SSH key pair that only GitHub Actions uses: `ssh-keygen -t ed25519 -f deploy_key -C github-deploy -N ""`.
2. Order the server with `cloud-init.yaml` as user data (replace `<DEPLOY_PUBLIC_KEY>` with `deploy_key.pub` and `<REPO_REF>` with `main`).
   Without cloud-init: log in once as root and run `DEPLOY_SSH_PUBLIC_KEY="$(cat deploy_key.pub)" bash scripts/bootstrap.sh`.
3. The end of `/var/log/kaucjapp-bootstrap.log` prints the server IP and the SSH host key line for `DEPLOY_KNOWN_HOSTS`.
4. DNS: create an `A` record `api.kaucjapp.pl` → server IP (TTL 300). Caddy obtains the certificate by itself.

### 2. Cloudflare R2
Create two buckets and one API token (R2 → Manage API tokens → Object Read & Write, limited to these buckets):

* `kaucjapp-profile-pictures`: enable a public custom domain, e.g. `cdn.kaucjapp.pl`. The app returns `https://cdn.kaucjapp.pl/<key>` for pictures.
* `kaucjapp-backups`: private. Optionally add a lifecycle rule that aborts incomplete multipart uploads.

The S3 endpoint is `https://<account-id>.r2.cloudflarestorage.com`.

### 3. Monitoring (free tiers)
* healthchecks.io: create a check with a 1 day period and 2 hours grace; put its ping URL into `BACKUP_HEALTHCHECK_URL`. You get an e-mail if the nightly backup fails or does not run.
* UptimeRobot: HTTPS monitor on `https://api.kaucjapp.pl/api/gateway/status` (5 min interval, e-mail alert).

### 4. GitHub
Settings → Environments → create `production` (optionally with required reviewers), then add:

| Variables | Secrets |
|-----------|---------|
| `DEPLOY_HOST` (server IP), `DEPLOY_USER` (optional, default `deploy`) | `DEPLOY_SSH_KEY` (content of `deploy_key`), `DEPLOY_KNOWN_HOSTS` |
| `API_DOMAIN`, `ACME_EMAIL` | `DB_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET`, `PASSWORD_SALT`, `IT_SECRET` |
| `DB_USER`, `ADMIN_USERNAME`, `ADMIN_EMAIL` | `ADMIN_PASSWORD`, `MAIL_PASSWORD` |
| `STORAGE_S3_ENDPOINT`, `STORAGE_S3_BUCKET`, `STORAGE_S3_PUBLIC_BASE_URL` | `STORAGE_S3_ACCESS_KEY`, `STORAGE_S3_SECRET_KEY` |
| `BACKUP_S3_ENDPOINT`, `BACKUP_S3_BUCKET` | `BACKUP_S3_ACCESS_KEY`, `BACKUP_S3_SECRET_KEY`, `BACKUP_HEALTHCHECK_URL` |

Use generated alphanumeric values for secrets (`openssl rand -hex 32`); the workflow rejects whitespace, `$`, `#`, quotes and backslashes
because Compose `.env` files treat them specially. The stack starts with empty databases; the bootstrap admin
is created from `ADMIN_*` on first start.

The repository also needs the secrets used by the existing test workflow (`backend-build-test.yml`).

## Everyday operation

* **Deploy**: merge to `main`. Images are built (only changed services are rebuilt, the rest are re-tagged), then `Deploy` runs automatically.
* **Deploy a branch / redeploy / go back**: Actions → Deploy → Run workflow, optionally with `image_tag` (a commit sha whose images exist).
* **Automatic rollback**: if the stack does not become healthy, or the smoke test fails, the previous good tag is started again.
  Flyway migrations are not rolled back, so keep them backward compatible (add columns/tables first, remove them one release later).
* **Logs and status** (on the server, as `deploy`): `cd /opt/kaucjapp && docker compose --env-file .env -f compose.prod.yaml ps`,
  `IMAGE_TAG=$(cat .current-tag) docker compose --env-file .env -f compose.prod.yaml logs -f --tail 100 gql-gateway`.
  Application logs are also stored in Postgres by the monitor service (`monitor_db.system_log`).
* **Memory check**: `docker stats --no-stream` (each container has a hard limit in `compose.prod.yaml`; the host should keep ≥ 400 MB available).
* **Server updates**: security patches install automatically; the server reboots at 04:00 when needed and all containers come back by themselves.

## Backups and recovery

* `kaucjapp-backup.timer` runs `backup.sh` at 02:30 UTC: `pg_dump -Fc` of all six databases, integrity-checked with `pg_restore --list`,
  stored in `R2:<bucket>/daily/<date>/` (14 days) and on Sundays also in `weekly/<year-week>/` (8 weeks).
* `kaucjapp-restore-drill.timer` restores the newest backup into throw-away databases on the 1st of every month and alerts on failure.
* Restore a backup: `scripts/restore.sh apply daily/2026-10-03` (stops the app, replaces the databases, starts it again), then run the smoke test.
* Lost server: order a new one, run bootstrap, set `DEPLOY_HOST`/`DEPLOY_KNOWN_HOSTS`, run Deploy, then `restore.sh apply`. Expect ≈ 30 minutes.
  Kafka and Redis hold no durable business data (Redis = sessions/rate limits), so they are not backed up.
* Redundancy: this is a single server. A VPS failure means downtime until you recover (see above), not data loss beyond the last nightly backup.
  If you need a smaller loss window, run `backup.sh` more often with an additional timer.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Deploy fails at "Upload deploy files" | `DEPLOY_HOST`, `DEPLOY_KNOWN_HOSTS` (must contain the current IP), key in `DEPLOY_SSH_KEY` |
| `denied` when pulling images | The workflow logs in with its own token; make sure "Build backend images" finished for that sha |
| Container restarts with exit 137 | Out of memory: look at `docker stats`, `dmesg \| grep -i oom`; raise the plan or the limit in `compose.prod.yaml` |
| No HTTPS certificate | DNS A record points to the server? Ports 80/443 open at the provider's firewall? `docker compose logs caddy` |
