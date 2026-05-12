package pl.isigmas.kaucjapp.offers.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.offers.model.Offer;
import pl.isigmas.kaucjapp.offers.model.OfferStatus;

import java.time.Instant;
import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByCreatorId(Long creatorId);

    List<Offer> findByCollectorIdAndStatusIn(Long collectorId, List<OfferStatus> statuses);

    List<Offer> findByCreatorIdAndStatusIn(Long creatorId, List<OfferStatus> statuses);

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

    @Modifying
    @Query("UPDATE Offer o SET o.status = :openStatus, o.collectorId = null, o.reservedAt = null, o.reservedTo = null " +
            "WHERE o.status = :reservedStatus AND o.reservedTo < :now")
    int releaseExpiredReservations(
            @Param("openStatus") OfferStatus openStatus,
            @Param("reservedStatus") OfferStatus reservedStatus,
            @Param("now") Instant now
    );

    @Modifying
    @Query("UPDATE Offer o SET o.status = :completedStatus, o.timeCompleted = :now, o.confirmationDeadline = null " +
            "WHERE o.status = :pendingStatus AND o.confirmationDeadline IS NOT NULL AND o.confirmationDeadline < :now")
    int completePendingOffers(
            @Param("pendingStatus") OfferStatus pendingStatus,
            @Param("completedStatus") OfferStatus completedStatus,
            @Param("now") Instant now
    );
}