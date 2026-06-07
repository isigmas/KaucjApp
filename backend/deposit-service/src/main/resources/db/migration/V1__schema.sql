CREATE TABLE retail_networks(
                                retail_network_id BIGSERIAL PRIMARY KEY,
                                name VARCHAR(100) NOT NULL UNIQUE,
                                is_active BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE deposit_machines(
                                deposit_machine_id BIGSERIAL PRIMARY KEY,
                                retail_network_id BIGINT NOT NULL REFERENCES retail_networks(retail_network_id),
                                status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
                                address TEXT,
                                latitude NUMERIC(9,6),
                                longitude NUMERIC(9,6),
                                created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE opening_hours (
                               opening_hours_id BIGSERIAL PRIMARY KEY,
                               deposit_machine_id BIGINT NOT NULL REFERENCES deposit_machines(deposit_machine_id) ON DELETE CASCADE ,
                               is_closed BOOLEAN NOT NULL DEFAULT false,
                               day_of_week INT NOT NULL, -- 1=monday, 7==sunday
                               open_time TIME NOT NULL,
                               close_time TIME NOT NULL,
                               UNIQUE (deposit_machine_id, day_of_week)
);

CREATE TABLE ratings (
                         deposit_machine_id        BIGINT PRIMARY KEY REFERENCES deposit_machines(deposit_machine_id) ON DELETE CASCADE,
                         avg_score      NUMERIC(3,2) DEFAULT 0.00 CHECK (avg_score BETWEEN 0 AND 5),
                         feedback_count INT DEFAULT 0
);

CREATE TABLE deposit_machines_reviews (
                              review_id    BIGSERIAL PRIMARY KEY,
                              deposit_machine_id BIGINT NOT NULL REFERENCES deposit_machines(deposit_machine_id) ON DELETE CASCADE ,
                              reviewer_id  BIGINT,
                              reviewer_username VARCHAR(100),
                              score        NUMERIC(3,2) NOT NULL CHECK (score BETWEEN 0 AND 5),
                              comment      TEXT,
                              created_at   TIMESTAMPTZ DEFAULT NOW(),
                              updated_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO retail_networks(name) VALUES
                                                ('Zabka'),
                                                ('Biedronka'),
                                                ('Lidl'),
                                                ('Kaufland'),
                                                ('Carrefour'),
                                                ('Auchan'),
                                                ('Aldi'),
                                                ('Dino'),
                                                ('Netto');


CREATE INDEX idx_deposit_machines_network  ON deposit_machines(retail_network_id);
CREATE INDEX idx_deposit_machine_status   ON deposit_machines(status);
CREATE INDEX idx_deposit_machine_location ON deposit_machines USING GIST (point(longitude, latitude));
CREATE UNIQUE INDEX idx_unique_reviewer_machine
    ON deposit_machines_reviews(reviewer_id, deposit_machine_id);