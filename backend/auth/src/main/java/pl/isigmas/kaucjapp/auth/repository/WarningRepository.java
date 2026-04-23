package pl.isigmas.kaucjapp.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.auth.entity.Warning;

public interface WarningRepository extends JpaRepository<Warning, Long> {
}
