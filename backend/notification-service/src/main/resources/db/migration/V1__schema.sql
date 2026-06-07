CREATE TABLE email_retry_tasks (
    task_id          UUID PRIMARY KEY,
    recipient_email  VARCHAR(255) NOT NULL,
    username         VARCHAR(255) NOT NULL,
    subject          VARCHAR(255) NOT NULL,
    message          TEXT NOT NULL,
    template_type    VARCHAR(64) NOT NULL,
    attempt_count    INTEGER NOT NULL,
    next_attempt_at  TIMESTAMPTZ NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL
);

CREATE TABLE warnings (
    warning_id UUID PRIMARY KEY,
    time       TIMESTAMPTZ NOT NULL,
    message    TEXT NOT NULL
);

CREATE INDEX idx_email_retry_tasks_next_attempt ON email_retry_tasks(next_attempt_at);
