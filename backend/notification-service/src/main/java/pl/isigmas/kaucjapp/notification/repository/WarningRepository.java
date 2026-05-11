package pl.isigmas.kaucjapp.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.notification.entity.Warning;

public interface WarningRepository extends JpaRepository<Warning, Long> {
}
