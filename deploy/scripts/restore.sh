#!/usr/bin/env bash
# Restore databases from the R2 backups created by backup.sh.
#
#   restore.sh drill [daily/YYYY-MM-DD]   SAFE: restores into temporary databases, checks them, drops them again.
#                                         Run monthly by systemd (kaucjapp-restore-drill.timer).
#   restore.sh apply [daily/YYYY-MM-DD]   DESTRUCTIVE: stops the application, replaces the live databases, starts it again.
#
# The default backup is the newest one in daily/.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

DATABASES=(users_db offers_db auth_db deposit_db notification_db monitor_db)
mode="${1:-}"
[[ "$mode" == "drill" || "$mode" == "apply" ]] || die "usage: restore.sh {drill|apply} [daily/YYYY-MM-DD]"
DB_USER="$(env_get DB_USER)"
BUCKET="$(env_get BACKUP_S3_BUCKET)"
HC_URL="$(env_get BACKUP_HEALTHCHECK_URL)"

export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ACCESS_KEY_ID="$(env_get BACKUP_S3_ACCESS_KEY)"
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$(env_get BACKUP_S3_SECRET_KEY)"
export RCLONE_CONFIG_R2_ENDPOINT="$(env_get BACKUP_S3_ENDPOINT)"

prefix="${2:-}"
if [[ -z "$prefix" ]]; then
  latest="$(rclone lsf "R2:$BUCKET/daily" --dirs-only --s3-no-check-bucket | sort | tail -n 1 | tr -d '/')"
  [[ -n "$latest" ]] || die "No backups found in R2:$BUCKET/daily"
  prefix="daily/$latest"
fi

WORK="$(mktemp -d /var/tmp/kaucjapp-restore.XXXXXX)"
trap 'rm -rf "$WORK"' EXIT
log "Downloading $prefix"
rclone copy "R2:$BUCKET/$prefix" "$WORK" --s3-no-check-bucket --quiet

psql_admin() { dc exec -T postgres psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d postgres "$@"; }

restore_into() { # restore_into <target_db> <dump_file>
  psql_admin -c "DROP DATABASE IF EXISTS \"$1\" WITH (FORCE)"
  psql_admin -c "CREATE DATABASE \"$1\""
  dc exec -T postgres pg_restore -U "$DB_USER" -d "$1" --no-owner --exit-on-error < "$2"
}

if [[ "$mode" == "drill" ]]; then
  failed=0
  for db in "${DATABASES[@]}"; do
    tmp="restore_drill_${db}"
    log "Drill: restoring $db into $tmp"
    if restore_into "$tmp" "$WORK/$db.dump"; then
      tables="$(dc exec -T postgres psql -U "$DB_USER" -d "$tmp" -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")"
      log "Drill: $db OK ($tables tables)"
    else
      log "Drill: $db FAILED"; failed=1
    fi
    psql_admin -c "DROP DATABASE IF EXISTS \"$tmp\" WITH (FORCE)" > /dev/null
  done
  if [[ "$failed" == "1" ]]; then
    [[ -z "$HC_URL" ]] || curl -fsS -m 10 --retry 3 -o /dev/null "${HC_URL}/fail" || true
    die "Restore drill failed for $prefix"
  fi
  log "Restore drill passed for $prefix"
  exit 0
fi

log "APPLY: this replaces the live databases with $prefix"
if [[ "${RESTORE_CONFIRM:-}" != "yes" ]]; then
  read -r -p "Type 'restore' to continue: " answer
  [[ "$answer" == "restore" ]] || die "Aborted"
fi

services=(gql-gateway auth-service users-service offers-service deposit-service notification-service monitor-service)
log "Stopping application services"
dc stop "${services[@]}"
for db in "${DATABASES[@]}"; do
  log "Restoring $db"
  restore_into "$db" "$WORK/$db.dump"
done
log "Starting application services"
dc up -d --wait --wait-timeout 420
log "Restore finished. Run deploy/scripts/smoke-test.sh to verify."
