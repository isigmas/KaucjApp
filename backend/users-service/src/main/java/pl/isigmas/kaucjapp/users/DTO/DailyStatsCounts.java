package pl.isigmas.kaucjapp.users.DTO;

/**
 * Projection for daily stat counters (single bucket or SUM over a period).
 */
public interface DailyStatsCounts {
    Long getReturnedPlastic();

    Long getReturnedCan();

    Long getCollectedPlastic();

    Long getCollectedCan();
}
