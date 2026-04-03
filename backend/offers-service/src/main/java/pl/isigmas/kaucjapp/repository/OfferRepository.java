package pl.isigmas.kaucjapp.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.model.Offer;
import pl.isigmas.kaucjapp.model.OfferStatus;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByCreatorId(Long creatorId);

    List<Offer> findByCollectorIdAndStatus(Long collectorId, OfferStatus status);

    @Query(value = "SELECT * FROM offers " +
            "WHERE status = 'OPEN' " +
            "AND point(longitude, latitude) <@ box(point(:swLon, :swLat), point(:neLon, :neLat))",
            nativeQuery = true)
    List<Offer> findOpenOffersInBoundingBox(
            @Param("swLat") double swLat,
            @Param("swLon") double swLon,
            @Param("neLat") double neLat,
            @Param("neLon") double neLon
    );
}