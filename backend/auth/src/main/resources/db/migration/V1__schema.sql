CREATE TABLE accounts (
    account_id    BIGSERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(32) NOT NULL DEFAULT 'USER',
    status        VARCHAR(32) NOT NULL DEFAULT 'INACTIVE'
);

CREATE TABLE refresh_tokens (
    token_id    BIGSERIAL PRIMARY KEY,
    account_id  BIGINT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP,
    is_revoked  BOOLEAN NOT NULL DEFAULT FALSE,
    device_info VARCHAR(255)
);

CREATE TABLE activation_tokens (
    token_id    BIGSERIAL PRIMARY KEY,
    account_id  BIGINT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP,
    is_used     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE reset_password_tokens (
    token_id    BIGSERIAL PRIMARY KEY,
    account_id  BIGINT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP,
    is_used     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE deletion_schedule (
    account_id              BIGINT PRIMARY KEY REFERENCES accounts(account_id) ON DELETE CASCADE,
    scheduled_deletion_date TIMESTAMP NOT NULL,
    backup_username         VARCHAR(255) NOT NULL,
    backup_email            VARCHAR(255) NOT NULL
);

CREATE INDEX idx_refresh_tokens_account ON refresh_tokens(account_id);
CREATE INDEX idx_activation_tokens_account ON activation_tokens(account_id);
CREATE INDEX idx_reset_password_tokens_account ON reset_password_tokens(account_id);
