#!/usr/bin/env bash
# End-to-end smoke test through the public gateway. Used by CI (compose) and by the deploy workflow (production).
#
# Usage: smoke-test.sh <base-url>
# Env:   ADMIN_USERNAME, ADMIN_PASSWORD  - credentials of the bootstrap admin (required)
#        SMOKE_UPLOAD=1                  - also exercise the profile picture upload flow (needs storage reachable
#                                          from the machine running the test)
set -euo pipefail

BASE_URL="${1:?usage: smoke-test.sh <base-url>}"
BASE_URL="${BASE_URL%/}"
: "${ADMIN_USERNAME:?ADMIN_USERNAME is required}"
: "${ADMIN_PASSWORD:?ADMIN_PASSWORD is required}"

failures=0
body_file="$(mktemp)"
trap 'rm -f "$body_file"' EXIT

# check <description> <expected status regex> <curl args...>
check() {
  local description="$1" expected="$2"
  shift 2
  local status
  status="$(curl -sS -o "$body_file" -w '%{http_code}' --max-time 20 "$@" || echo 000)"
  if [[ "$status" =~ ^($expected)$ ]]; then
    echo "ok   $description ($status)"
  else
    echo "FAIL $description: expected $expected, got $status"
    head -c 400 "$body_file" 2>/dev/null || true
    echo
    failures=$((failures + 1))
  fi
}

echo "Smoke test against $BASE_URL"

# Public endpoints
check "gateway status" 200 "$BASE_URL/api/gateway/status"
check "auth status" 200 "$BASE_URL/api/auth/status"
check "graphql query" 200 -X POST "$BASE_URL/graphql" \
  -H 'Content-Type: application/json' -d '{"query":"{ hello }"}'
if ! grep -q 'Hello from GraphQL Gateway' "$body_file"; then
  echo "FAIL graphql response did not contain the expected data"
  failures=$((failures + 1))
fi

# Security: protected routes must reject anonymous calls
check "anonymous call is rejected" '401|403' "$BASE_URL/api/user/me"

# Login as bootstrap admin
login_payload="$(printf '{"identifier":"%s","password":"%s"}' "$ADMIN_USERNAME" "$ADMIN_PASSWORD")"
status="$(curl -sS -o "$body_file" -w '%{http_code}' --max-time 20 -X POST "$BASE_URL/api/auth/login" \
  -H 'Content-Type: application/json' -d "$login_payload" || echo 000)"
if [[ "$status" != "200" ]]; then
  echo "FAIL admin login: got $status"
  failures=$((failures + 1))
  echo "$failures check(s) failed"
  exit 1
fi
REFRESH_TOKEN="$(tr -d '"' < "$body_file")"
echo "ok   admin login (200)"

# Login returns a refresh token; exchange it for the short-lived JWT used on every other route
status="$(curl -sS -o "$body_file" -w '%{http_code}' --max-time 20 -X POST "$BASE_URL/api/auth/refresh" \
  -H 'Content-Type: text/plain' --data-binary "$REFRESH_TOKEN" || echo 000)"
if [[ "$status" != "200" ]]; then
  echo "FAIL token refresh: got $status"
  echo "1 or more check(s) failed"
  exit 1
fi
TOKEN="$(tr -d '"' < "$body_file")"
echo "ok   token refresh (200)"
AUTH=(-H "Authorization: Bearer $TOKEN")

# Every downstream service must be reachable through the gateway
check "auth admin route" 200 "${AUTH[@]}" "$BASE_URL/api/auth/admin/status"
check "offers service route" 200 "${AUTH[@]}" "$BASE_URL/api/offer/test"
check "deposit service route" 200 "${AUTH[@]}" "$BASE_URL/api/deposit/test"
check "notification service route" 200 "${AUTH[@]}" "$BASE_URL/api/notification/status"
check "monitor service route" 200 "${AUTH[@]}" "$BASE_URL/api/monitor/status"
check "monitor logs (postgres)" 200 "${AUTH[@]}" "$BASE_URL/api/monitor/admin/logs"
check "users service route" '200|404' "${AUTH[@]}" "$BASE_URL/api/user/me"

if [[ "${SMOKE_UPLOAD:-0}" == "1" ]]; then
  # The users-service profile of the admin must exist (it is synced through Kafka after registration).
  user_id="$(python3 - "$TOKEN" <<'PY'
import base64, json, sys
payload = sys.argv[1].split(".")[1]
payload += "=" * (-len(payload) % 4)
print(json.loads(base64.urlsafe_b64decode(payload)).get("user_id", ""))
PY
)"
  if [[ -z "$user_id" ]]; then
    echo "FAIL could not read user_id from JWT"
    failures=$((failures + 1))
  else
    check "profile picture upload url" 200 "${AUTH[@]}" \
      "$BASE_URL/api/user/me/profile-picture/upload-url?content_type=image/jpeg"
    upload_url="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("upload_url",""))' "$body_file")"
    blob_name="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("blob_name",""))' "$body_file")"
    if [[ -n "$upload_url" && -n "$blob_name" ]]; then
      # smallest valid JPEG signature + padding
      printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x02\x03\x04' > "$body_file.jpg"
      check "direct upload to storage" '200|201|204' -X PUT -H 'Content-Type: image/jpeg' \
        --data-binary "@$body_file.jpg" "$upload_url"
      rm -f "$body_file.jpg"
      me_status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "${AUTH[@]}" "$BASE_URL/api/user/me" || echo 000)"
      if [[ "$me_status" == "200" ]]; then
        check "confirm upload" 200 "${AUTH[@]}" -X POST -H 'Content-Type: application/json' \
          -d "$(printf '{"blob_name":"%s"}' "$blob_name")" "$BASE_URL/api/user/me/profile-picture/confirm"
        check "delete profile picture" 204 "${AUTH[@]}" -X DELETE "$BASE_URL/api/user/me/profile-picture"
      else
        echo "skip confirm/delete: admin has no users-service profile (seed one through users.sync to test them)"
      fi
    else
      echo "FAIL upload url response did not contain upload_url/blob_name"
      failures=$((failures + 1))
    fi
  fi
fi

if (( failures > 0 )); then
  echo "$failures check(s) failed"
  exit 1
fi
echo "All smoke checks passed"
