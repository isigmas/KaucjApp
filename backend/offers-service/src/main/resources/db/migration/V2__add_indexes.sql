-- Indexes from V1 may be missing when the schema was baselined after Hibernate created tables.
CREATE INDEX IF NOT EXISTS idx_offers_creator ON offers(creator_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_location ON offers USING GIST (point(longitude, latitude));
