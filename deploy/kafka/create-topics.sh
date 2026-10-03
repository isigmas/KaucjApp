#!/bin/sh
# Creates all topics listed in /topics.txt. Idempotent (--if-not-exists).
set -eu

BOOTSTRAP="${KAFKA_BOOTSTRAP:-kafka:9092}"
TOPICS_FILE="${TOPICS_FILE:-/topics.txt}"

while IFS= read -r topic || [ -n "$topic" ]; do
  case "$topic" in
    ''|'#'*) continue ;;
  esac
  echo "Ensuring topic: $topic"
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server "$BOOTSTRAP" \
    --create --if-not-exists \
    --topic "$topic" --partitions 1 --replication-factor 1 \
    --config retention.ms=86400000
done < "$TOPICS_FILE"

echo "All topics ready"
