CREATE TABLE users (
                       user_id     BIGSERIAL PRIMARY KEY,
                       username    VARCHAR(100) NOT NULL UNIQUE,
                       first_name  VARCHAR(50) NOT NULL,
                       last_name   VARCHAR(50) NOT NULL,
                       email       VARCHAR(255) NOT NULL UNIQUE,
                       phone       VARCHAR(20),
                       created_at  TIMESTAMPTZ DEFAULT NOW(),
                       updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ratings (
                         user_id        BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
                         avg_score      NUMERIC(3,2) DEFAULT 0.00 CHECK (avg_score BETWEEN 0 AND 5),
                         feedback_count INT DEFAULT 0
);

CREATE TABLE user_reviews (
                              review_id    BIGSERIAL PRIMARY KEY,
                              reviewee_id  BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                              reviewer_id  BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
                              score        NUMERIC(3,2) NOT NULL CHECK (score BETWEEN 0 AND 5),
                              comment      TEXT,
                              created_at   TIMESTAMPTZ DEFAULT NOW(),
                              updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_addresses (
                                address_id    BIGSERIAL PRIMARY KEY,
                                user_id       BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                                address_label VARCHAR(50),
                                address       VARCHAR(255) NOT NULL,
                                latitude      NUMERIC(9,6) NOT NULL,
                                longitude     NUMERIC(9,6) NOT NULL,
                                is_default    BOOLEAN DEFAULT FALSE,
                                created_at    TIMESTAMPTZ DEFAULT NOW(),
                                updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_stats (
                            user_id                 BIGINT PRIMARY KEY,
                            returned_plastic_count  INTEGER NOT NULL DEFAULT 0,
                            returned_can_count      INTEGER NOT NULL DEFAULT 0,
                            collected_plastic_count INTEGER NOT NULL DEFAULT 0,
                            collected_can_count     INTEGER NOT NULL DEFAULT 0,

                            CONSTRAINT fk_user_stats_account FOREIGN KEY (user_id)
                                REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_reviews_reviewee ON user_reviews(reviewee_id);
CREATE INDEX idx_user_stats_returned ON user_stats(returned_plastic_count DESC);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE UNIQUE INDEX idx_only_one_default_address
    ON user_addresses(user_id)
    WHERE (is_default = TRUE);