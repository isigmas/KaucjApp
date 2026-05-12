package pl.isigmas.kaucjapp.users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.users.model.UserStats;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, Long> {

    @Modifying
    @Query("UPDATE UserStats u SET u.returnedPlasticCount = u.returnedPlasticCount + :plastic, u.returnedCanCount = u.returnedCanCount + :can WHERE u.userId = :userId")
    void incrementReturnedStats(@Param("userId") Long userId, @Param("plastic") int plastic, @Param("can") int can);

    @Modifying
    @Query("UPDATE UserStats u SET u.collectedPlasticCount = u.collectedPlasticCount + :plastic, u.collectedCanCount = u.collectedCanCount + :can WHERE u.userId = :userId")
    void incrementCollectedStats(@Param("userId") Long userId, @Param("plastic") int plastic, @Param("can") int can);
}