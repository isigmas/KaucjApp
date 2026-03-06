CREATE TABLE users (
                       user_id BIGSERIAL PRIMARY KEY,
                       username VARCHAR(255) NOT NULL UNIQUE,
                       phone_number VARCHAR(50),
                       default_address VARCHAR(255)
);

CREATE TABLE offers (
                        offer_id BIGSERIAL PRIMARY KEY,
                        creator_id BIGINT NOT NULL,
                        collector_id BIGINT,

                        CONSTRAINT fk_creator FOREIGN KEY (creator_id) REFERENCES users(user_id),
                        CONSTRAINT fk_collector FOREIGN KEY (collector_id) REFERENCES users(user_id)
);

CREATE TABLE bottle_price(
    bottle_id BIGINT PRIMARY KEY,
    price DECIMAL(10, 2),
    CONSTRAINT check_bottle_id CHECK (bottle_id IN (1,2))
);

CREATE TABLE counts(
        offer_id BIGINT,
        bottle_id BIGINT,
        quantity INTEGER DEFAULT 0,

        PRIMARY KEY (offer_id, bottle_id),

        CONSTRAINT fk_offer FOREIGN KEY (offer_id) REFERENCES offers(offer_id),
            CONSTRAINT fk_bottle FOREIGN KEY (bottle_id) REFERENCES bottle_price(bottle_id)
);

CREATE TABLE offer_info (
                    offer_id BIGINT PRIMARY KEY,
                    pickup_address VARCHAR(255),
                    pickup_instructions TEXT,
                    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
                    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    time_completed TIMESTAMP,

                    CONSTRAINT fk_offer FOREIGN KEY (offer_id) REFERENCES offers(offer_id)
);

