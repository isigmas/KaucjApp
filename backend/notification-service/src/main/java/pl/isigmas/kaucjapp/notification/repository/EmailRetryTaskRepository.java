package pl.isigmas.kaucjapp.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.notification.entity.EmailRetryTask;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface EmailRetryTaskRepository extends JpaRepository<EmailRetryTask, UUID> {

    List<EmailRetryTask> findByNextAttemptAtLessThanEqual(Instant now);
}
