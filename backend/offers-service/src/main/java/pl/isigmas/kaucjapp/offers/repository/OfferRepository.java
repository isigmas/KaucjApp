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
import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    @Query("SELECT DISTINCT o FROM Offer o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.bottleType WHERE o.id = :id")
    Optional<Offer> findByIdWithItems(@Param("id") Long id);

    @Query("SELECT DISTINCT o FROM Offer o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.bottleType")
    List<Offer> findAllWithItems();

    @Query("SELECT DISTINCT o FROM Offer o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.bottleType " +
            "WHERE o.creatorId = :creatorId AND o.status IN :statuses")
    List<Offer> findByCreatorIdAndStatusInWithItems(
            @Param("creatorId") Long creatorId,
            @Param("statuses") List<OfferStatus> statuses
    );

    @Query("SELECT DISTINCT o FROM Offer o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.bottleType " +
            "WHERE o.collectorId = :collectorId AND o.status IN :statuses")
    List<Offer> findByCollectorIdAndStatusInWithItems(
            @Param("collectorId") Long collectorId,
            @Param("statuses") List<OfferStatus> statuses
    );

    @Query("SELECT DISTINCT o FROM Offer o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.bottleType WHERE o.id IN :ids")
    List<Offer> findAllByIdInWithItems(@Param("ids") List<Long> ids);

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

    @Query("SELECT DISTINCT o FROM Offer o JOIN FETCH o.items i JOIN FETCH i.bottleType " +
            "WHERE o.status = :pendingStatus AND o.confirmationDeadline IS NOT NULL AND o.confirmationDeadline < :now")
    List<Offer> findAllPendingOffersPastDeadline(
            @Param("pendingStatus") OfferStatus pendingStatus,
            @Param("now") Instant now
    );
}