package pl.isigmas.kaucjapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.model.Offer;

public interface OfferRepository extends JpaRepository<Offer, Long> {
}