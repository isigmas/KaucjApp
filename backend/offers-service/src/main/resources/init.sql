CREATE TABLE bottle_types (
                              bottle_id    BIGSERIAL PRIMARY KEY,
                              name         VARCHAR(50) NOT NULL UNIQUE,
                              deposit_fee  NUMERIC(10,2) NOT NULL DEFAULT 0.50
);

INSERT INTO bottle_types (name, deposit_fee) VALUES
                                                 ('plastic', 0.50),
                                                 ('can', 0.50);

CREATE TABLE offers (
                        offer_id        BIGSERIAL PRIMARY KEY,
                        creator_id      BIGINT NOT NULL,
                        collector_id    BIGINT,
                        status          VARCHAR(50) NOT NULL DEFAULT 'OPEN',
                        pickup_address  VARCHAR(255),
                        latitude        NUMERIC(9,6),
                        longitude       NUMERIC(9,6),
                        pickup_instructions TEXT,
                        created_at      TIMESTAMP DEFAULT NOW(),
                        updated_at      TIMESTAMP DEFAULT NOW(),
                        completed_at    TIMESTAMP
);

CREATE INDEX idx_offers_creator  ON offers(creator_id);
CREATE INDEX idx_offers_status   ON offers(status);
CREATE INDEX idx_offers_location ON offers USING GIST (point(longitude, latitude));

CREATE TABLE offer_items (
                             offer_id    BIGINT NOT NULL REFERENCES offers(offer_id) ON DELETE CASCADE,
                             bottle_id   BIGINT NOT NULL REFERENCES bottle_types(bottle_id),
                             quantity    INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
                             unit_price  NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
                             PRIMARY KEY (offer_id, bottle_id)
);