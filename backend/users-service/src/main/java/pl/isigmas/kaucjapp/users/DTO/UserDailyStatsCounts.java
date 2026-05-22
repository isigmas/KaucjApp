package pl.isigmas.kaucjapp.users.DTO;

/**
 * Per-user aggregated daily stats (e.g. period ranking).
 */
public interface UserDailyStatsCounts extends DailyStatsCounts {
    Long getUserId();
}
