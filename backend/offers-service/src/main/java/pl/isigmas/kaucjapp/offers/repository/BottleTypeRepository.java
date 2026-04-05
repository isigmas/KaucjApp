package pl.isigmas.kaucjapp.offers.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.offers.model.BottleType;

public interface BottleTypeRepository extends JpaRepository<BottleType, Long> {
}