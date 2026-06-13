-- Indexes from V1 may be missing when the schema was baselined after Hibernate created tables.
CREATE INDEX IF NOT EXISTS idx_deposit_machines_network ON deposit_machines(retail_network_id);
CREATE INDEX IF NOT EXISTS idx_deposit_machine_status ON deposit_machines(status);
CREATE INDEX IF NOT EXISTS idx_deposit_machine_location ON deposit_machines USING GIST (point(longitude, latitude));

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_reviewer_machine
    ON deposit_machines_reviews(reviewer_id, deposit_machine_id);
