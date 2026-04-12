package pl.isigmas.kaucjapp.offers.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.offers.model.BottleType;

import java.util.Optional;

public interface BottleTypeRepository extends JpaRepository<BottleType, Long> {

    Optional<BottleType> findByName(String name);
}