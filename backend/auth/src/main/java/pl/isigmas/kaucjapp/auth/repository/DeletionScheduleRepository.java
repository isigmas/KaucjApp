package pl.isigmas.kaucjapp.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.auth.entity.DeletionSchedule;

import java.time.Instant;
import java.util.List;

public interface DeletionScheduleRepository extends JpaRepository<DeletionSchedule, Long> {
    List<DeletionSchedule> findAllByScheduledDeletionDateBefore(Instant now);
}
