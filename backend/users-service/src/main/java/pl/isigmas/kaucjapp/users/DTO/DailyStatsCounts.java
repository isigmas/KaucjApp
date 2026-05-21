package pl.isigmas.kaucjapp.users.DTO;

/**
 * Projection for daily stat counters (single bucket or SUM over a period).
 */
public interface DailyStatsCounts {
    Long getReturnedBottle();

    Long getReturnedCan();

    Long getCollectedBottle();

    Long getCollectedCan();
}
