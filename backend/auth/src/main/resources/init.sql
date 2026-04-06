CREATE TYPE account_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

CREATE TABLE accounts
(
    account_id    BIGSERIAL PRIMARY KEY,
    username      VARCHAR(100)   NOT NULL UNIQUE,
    email         VARCHAR(255)   NOT NULL UNIQUE,
    password_hash VARCHAR(255)   NOT NULL,
    role          account_role   NOT NULL DEFAULT 'USER',
    status        account_status NOT NULL DEFAULT 'INACTIVE'
);

CREATE TABLE refresh_tokens (
    token_id BIGSERIAL PRIMARY KEY,
    account_id BIGSERIAL NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    device_info VARCHAR(255)
);