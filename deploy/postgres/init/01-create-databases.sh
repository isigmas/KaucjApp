#!/bin/sh
# Creates one database per service inside the single Postgres instance.
# Idempotent: safe to run on an existing cluster (deploy.sh runs it on every deploy), and it is also picked up
# by the official postgres image on first start via /docker-entrypoint-initdb.d.
set -eu

for db in users_db offers_db auth_db deposit_db notification_db monitor_db; do
  exists=$(psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$db'")
  if [ "$exists" != "1" ]; then
    echo "Creating database $db"
    psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $db"
  fi
done
