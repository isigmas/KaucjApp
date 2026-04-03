package pl.isigmas.kaucjapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.model.BottleType;

public interface BottleTypeRepository extends JpaRepository<BottleType, Long> {
}