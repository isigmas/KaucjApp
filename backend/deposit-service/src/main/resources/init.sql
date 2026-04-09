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
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE opening_hours (
                               opening_hours_id BIGSERIAL PRIMARY KEY,
                               deposit_machine_id BIGINT NOT NULL REFERENCES deposit_machines(deposit_machine_id) ON DELETE CASCADE ,
                               day_of_week INT NOT NULL, -- 1=monday, 7==sunday
                               open_time TIME NOT NULL,
                               close_time TIME NOT NULL,
                               UNIQUE (deposit_machine_id, day_of_week)
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