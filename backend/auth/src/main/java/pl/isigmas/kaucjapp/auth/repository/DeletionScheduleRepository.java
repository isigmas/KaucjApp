package pl.isigmas.kaucjapp.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.isigmas.kaucjapp.auth.entity.DeletionSchedule;

import java.time.Instant;
import java.util.List;

public interface DeletionScheduleRepository extends JpaRepository<DeletionSchedule, Long> {
    @Query("SELECT s FROM DeletionSchedule s JOIN FETCH s.account WHERE s.scheduledDeletionDate < :now")
    List<DeletionSchedule> findAllByScheduledDeletionDateBefore(@Param("now") Instant now);
}
