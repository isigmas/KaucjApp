package pl.isigmas.kaucjapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.model.Offer;
import pl.isigmas.kaucjapp.model.OfferStatus;
import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByCreatorId(Long creatorId);

    List<Offer> findByCollectorIdAndInfoStatus(Long collectorId, OfferStatus status);
}