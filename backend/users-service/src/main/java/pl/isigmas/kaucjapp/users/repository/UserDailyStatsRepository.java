package pl.isigmas.kaucjapp.users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.users.DTO.DailyStatsAggregation;
import pl.isigmas.kaucjapp.users.model.UserStats;

import java.time.Instant;

@Repository
public interface UserDailyStatsRepository extends JpaRepository<UserStats, Long> {

    @Modifying
    @Query(value = """
            INSERT INTO user_daily_stats (user_id, stat_date, returned_plastic_count, returned_can_count, collected_plastic_count, collected_can_count)
            VALUES (:userId, :statDate, :retPlastic, :retCan, :colPlastic, :colCan)
            ON CONFLICT (user_id, stat_date) DO UPDATE SET
                returned_plastic_count = user_daily_stats.returned_plastic_count + :retPlastic,
                returned_can_count = user_daily_stats.returned_can_count + :retCan,
                collected_plastic_count = user_daily_stats.collected_plastic_count + :colPlastic,
                collected_can_count = user_daily_stats.collected_can_count + :colCan
            """, nativeQuery = true)
    void upsertDailyStats(
            @Param("userId") Long userId,
            @Param("statDate") Instant statDate,
            @Param("retPlastic") int retPlastic,
            @Param("retCan") int retCan,
            @Param("colPlastic") int colPlastic,
            @Param("colCan") int colCan
    );

    @Query(value = """
            SELECT 
                COALESCE(SUM(returned_plastic_count), 0) as returnedPlastic,
                COALESCE(SUM(returned_can_count), 0) as returnedCan,
                COALESCE(SUM(collected_plastic_count), 0) as collectedPlastic,
                COALESCE(SUM(collected_can_count), 0) as collectedCan
            FROM user_daily_stats
            WHERE user_id = :userId AND stat_date >= :startDate AND stat_date <= :endDate
            """, nativeQuery = true)
    DailyStatsAggregation getStatsForPeriod(
            @Param("userId") Long userId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );
}