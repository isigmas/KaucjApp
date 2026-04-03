package pl.isigmas.kaucjapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.model.BottlePrice;

public interface BottlePriceRepository extends JpaRepository<BottlePrice, Long> {
}