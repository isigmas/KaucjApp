package pl.isigmas.kaucjapp.users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.users.model.UserStats;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, Long> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            INSERT INTO user_stats (user_id, returned_plastic_count, returned_can_count, collected_plastic_count, collected_can_count)
            VALUES (:userId, :plastic, :can, 0, 0)
            ON CONFLICT (user_id) DO UPDATE SET
                returned_plastic_count = user_stats.returned_plastic_count + EXCLUDED.returned_plastic_count,
                returned_can_count = user_stats.returned_can_count + EXCLUDED.returned_can_count
            """, nativeQuery = true)
    void incrementReturnedStats(@Param("userId") Long userId, @Param("plastic") int plastic, @Param("can") int can);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            INSERT INTO user_stats (user_id, returned_plastic_count, returned_can_count, collected_plastic_count, collected_can_count)
            VALUES (:userId, 0, 0, :plastic, :can)
            ON CONFLICT (user_id) DO UPDATE SET
                collected_plastic_count = user_stats.collected_plastic_count + EXCLUDED.collected_plastic_count,
                collected_can_count = user_stats.collected_can_count + EXCLUDED.collected_can_count
            """, nativeQuery = true)
    void incrementCollectedStats(@Param("userId") Long userId, @Param("plastic") int plastic, @Param("can") int can);

    @Query("SELECT COALESCE(SUM(u.returnedPlasticCount), 0) FROM UserStats u")
    long getTotalReturnedPlasticCount();

    @Query("SELECT COALESCE(SUM(u.returnedCanCount), 0) FROM UserStats u")
    long getTotalReturnedCanCount();

    @Query("SELECT COALESCE(SUM(u.returnedPlasticCount + u.returnedCanCount), 0) FROM UserStats u")
    long getTotalReturnedItemsCount();
}
