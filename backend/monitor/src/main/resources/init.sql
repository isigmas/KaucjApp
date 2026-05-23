CREATE TABLE system_log (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            service_name VARCHAR(63) NOT NULL,
                            level VARCHAR(15) NOT NULL,
                            message TEXT NOT NULL,
                            timestamp BIGINT NOT NULL
);

CREATE INDEX idx_system_log_level_time ON system_log(level, timestamp);