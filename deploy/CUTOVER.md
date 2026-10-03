# Dry run and cut-over from Azure to the VPS

The Azure environment holds no data worth keeping, so there is **no data migration**: the VPS starts with empty databases
(Flyway creates the schemas, the bootstrap admin is created from `ADMIN_*`). Cut-over is only about DNS/clients.

## Phase 1: Dry run of the branch

1. Do the one-time setup from [README.md](README.md) (server, R2, GitHub Environment `production`).
2. Push the branch `kaucjap-three-dot-zero-prod-by-maxxx`. "Build backend images" builds all images for the commit sha.
3. Actions → Deploy → Run workflow (select that branch). The workflow deploys, runs the smoke test (public endpoints, login,
   JWT routes of every service, monitor logs) and rolls back on failure.
4. Checks the smoke test cannot do for you:
   * Profile pictures: `SMOKE_UPLOAD=1 ADMIN_USERNAME=... ADMIN_PASSWORD=... deploy/scripts/smoke-test.sh https://<domain>`, then open the picture URL in a browser.
   * Registration e-mail: register a test account and confirm the activation mail arrives (checks `MAIL_PASSWORD`).
   * WebSocket: GraphQL subscriptions on `wss://<domain>/graphql` and the admin log stream `wss://<domain>/api/monitor/admin/ws/logs`
     go through Caddy; connect with the mobile app (or `wscat`) and check that messages arrive.
   * Memory: `docker stats --no-stream` after the checks. The sum should stay well below the server RAM; `free -m` should show little swap use.
   * Backup (as `deploy`, which has no sudo): `/opt/kaucjapp/scripts/backup.sh`, then `/opt/kaucjapp/scripts/restore.sh drill`.

## Phase 2: Cut-over

1. Merge to `main` (images + deploy run automatically) and make sure `API_DOMAIN=api.kaucjapp.pl` resolves to the VPS.
2. Ship a new mobile build with `EXPO_PUBLIC_API_URL=https://api.kaucjapp.pl/api` (`mobile/KaucjApp/.env`) and update
   `scripts/deposit_machines_processing` (`API_URL` env variable).
3. Delete the Azure resources: `azd down --purge --force` from a checkout of the git tag `azure-final` (it still contains `infra/`; push the tag with `git push origin azure-final`) or delete the resource group in the portal. Check the Azure bill the next day.

Old mobile builds that still point to the Azure URL stop working after step 3; since there is no data to keep, this is acceptable only
if no one relies on them. If needed, turn the Azure `gql-gateway` app into a proxy before deleting it:
`az containerapp update -g <rg> -n <app> --image caddy:2-alpine --command caddy --args "reverse-proxy,--from,:8080,--to,https://api.kaucjapp.pl" --min-replicas 0 --max-replicas 1`.
