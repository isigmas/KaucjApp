package pl.isigmas.kaucjapp.users.DTO;

public interface DailyStatsAggregation {
    Long getReturnedPlastic();
    Long getReturnedCan();
    Long getCollectedPlastic();
    Long getCollectedCan();
}