CREATE TABLE IF NOT EXISTS user_daily_stats (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    stat_date               DATE NOT NULL,
    returned_plastic_count  INTEGER NOT NULL DEFAULT 0,
    returned_can_count      INTEGER NOT NULL DEFAULT 0,
    collected_plastic_count INTEGER NOT NULL DEFAULT 0,
    collected_can_count     INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_stats_user_date ON user_daily_stats(user_id, stat_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_date_ranking ON user_daily_stats(stat_date DESC, user_id);
