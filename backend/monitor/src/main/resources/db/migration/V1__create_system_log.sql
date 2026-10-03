CREATE TABLE IF NOT EXISTS system_log (
    id           BIGSERIAL PRIMARY KEY,
    service_name TEXT   NOT NULL,
    level        TEXT   NOT NULL,
    message      TEXT   NOT NULL,
    timestamp    BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_system_log_timestamp ON system_log (timestamp DESC, id DESC);
