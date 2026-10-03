#!/usr/bin/env bash
# Shared helpers for the scripts that run on the server. Source it, do not execute it.

APP_DIR="${APP_DIR:-/opt/kaucjapp}"
COMPOSE_FILE="$APP_DIR/compose.prod.yaml"
ENV_FILE="$APP_DIR/.env"

log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }
die() { log "ERROR: $*" >&2; exit 1; }

# env_get KEY  - read a value from .env WITHOUT sourcing it (values may contain shell metacharacters).
env_get() {
  local key="$1" line
  line="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 || true)"
  printf '%s' "${line#*=}"
}

# current_tag - the image tag that is (or should be) running
current_tag() {
  if [[ -f "$APP_DIR/.current-tag" ]]; then cat "$APP_DIR/.current-tag"; else env_get IMAGE_TAG; fi
}

# dc <args...> - docker compose bound to the production project
dc() {
  IMAGE_TAG="${IMAGE_TAG:-$(current_tag)}" docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}
