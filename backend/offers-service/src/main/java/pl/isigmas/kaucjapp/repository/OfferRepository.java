package pl.isigmas.kaucjapp.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.model.Offer;
import pl.isigmas.kaucjapp.model.OfferStatus;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByCreatorId(Long creatorId);

    List<Offer> findByCollectorIdAndStatus(Long collectorId, OfferStatus status);

    @EntityGraph(attributePaths = {"items"})
    List<Offer> findAll();
}