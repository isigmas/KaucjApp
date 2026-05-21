package pl.isigmas.kaucjapp.users.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.users.DTO.DailyStatsCounts;
import pl.isigmas.kaucjapp.users.DTO.UserDailyStatsCounts;
import pl.isigmas.kaucjapp.users.model.UserStats;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserDailyStatsRepository extends JpaRepository<UserStats, Long> {

    @Modifying(flushAutomatically = true)
    @Query(value = """
            INSERT INTO user_daily_stats (user_id, stat_date, returned_bottle_count, returned_can_count, collected_bottle_count, collected_can_count)
            VALUES (:userId, :statDate, :retBottles, :retCans, :colBottles, :colCans)
            ON CONFLICT (user_id, stat_date) DO UPDATE SET
                returned_bottle_count = user_daily_stats.returned_bottle_count + :retBottles,
                returned_can_count = user_daily_stats.returned_can_count + :retCans,
                collected_bottle_count = user_daily_stats.collected_bottle_count + :colBottles,
                collected_can_count = user_daily_stats.collected_can_count + :colCans
            """, nativeQuery = true)
    void upsertDailyStats(
            @Param("userId") Long userId,
            @Param("statDate") LocalDate statDate,
            @Param("retBottles") int retBottles,
            @Param("retCans") int retCans,
            @Param("colBottles") int colBottles,
            @Param("colCans") int colCans
    );

    @Query(value = """
            SELECT
                returned_bottle_count::bigint AS returnedBottle,
                returned_can_count::bigint AS returnedCan,
                collected_bottle_count::bigint AS collectedBottle,
                collected_can_count::bigint AS collectedCan
            FROM user_daily_stats
            WHERE user_id = :userId AND stat_date = :statDate
            """, nativeQuery = true)
    Optional<DailyStatsCounts> findDailyBucket(
            @Param("userId") Long userId,
            @Param("statDate") LocalDate statDate
    );

    @Query(value = """
            SELECT
                COALESCE(SUM(returned_bottle_count), 0) as returnedBottle,
                COALESCE(SUM(returned_can_count), 0) as returnedCan,
                COALESCE(SUM(collected_bottle_count), 0) as collectedBottle,
                COALESCE(SUM(collected_can_count), 0) as collectedCan
            FROM user_daily_stats
            WHERE user_id = :userId AND stat_date >= :startDate AND stat_date <= :endDate
            """, nativeQuery = true)
    DailyStatsCounts getStatsForPeriod(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
            SELECT
                user_id AS userId,
                COALESCE(SUM(returned_bottle_count), 0) AS returnedBottle,
                COALESCE(SUM(returned_can_count), 0) AS returnedCan,
                COALESCE(SUM(collected_bottle_count), 0) AS collectedBottle,
                COALESCE(SUM(collected_can_count), 0) AS collectedCan
            FROM user_daily_stats
            WHERE stat_date >= :startDate AND stat_date <= :endDate
            GROUP BY user_id
            ORDER BY
                CASE WHEN :sortType = 'returned_bottle' THEN SUM(returned_bottle_count)
                     WHEN :sortType = 'returned_can' THEN SUM(returned_can_count)
                     WHEN :sortType = 'collected_bottle' THEN SUM(collected_bottle_count)
                     WHEN :sortType = 'collected_can' THEN SUM(collected_can_count)
                     WHEN :sortType = 'returned_total' THEN SUM(returned_bottle_count + returned_can_count)
                     WHEN :sortType = 'collected_total' THEN SUM(collected_bottle_count + collected_can_count)
                     ELSE 0 END DESC
            """, nativeQuery = true)
    List<UserDailyStatsCounts> findTopUsersStatsForPeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("sortType") String sortType,
            Pageable pageable
    );
}
