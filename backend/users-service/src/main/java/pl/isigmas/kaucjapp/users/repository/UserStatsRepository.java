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
    @Query("UPDATE UserStats u SET u.returnedBottleCount = u.returnedBottleCount + :bottles, u.returnedCanCount = u.returnedCanCount + :cans WHERE u.userId = :userId")
    void incrementReturnedStats(@Param("userId") Long userId, @Param("bottles") int bottles, @Param("cans") int cans);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE UserStats u SET u.collectedBottleCount = u.collectedBottleCount + :bottles, u.collectedCanCount = u.collectedCanCount + :cans WHERE u.userId = :userId")
    void incrementCollectedStats(@Param("userId") Long userId, @Param("bottles") int bottles, @Param("cans") int cans);

    @Query("SELECT COALESCE(SUM(u.returnedBottleCount), 0) FROM UserStats u")
    long getTotalReturnedBottleCount();

    @Query("SELECT COALESCE(SUM(u.returnedCanCount), 0) FROM UserStats u")
    long getTotalReturnedCanCount();

    @Query("SELECT COALESCE(SUM(u.returnedBottleCount + u.returnedCanCount), 0) FROM UserStats u")
    long getTotalReturnedItemsCount();
}
