package pl.isigmas.kaucjapp.users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.users.model.ProcessedOfferEvent;

@Repository
public interface ProcessedOfferEventRepository extends JpaRepository<ProcessedOfferEvent, Long> {

    /**
     * @return 1 if this offer was recorded for the first time, 0 if already processed
     */
    @Modifying(flushAutomatically = true)
    @Query(value = """
            INSERT INTO processed_offer_events (offer_id, processed_at)
            VALUES (:offerId, NOW())
            ON CONFLICT DO NOTHING
            """, nativeQuery = true)
    int tryMarkProcessed(@Param("offerId") Long offerId);
}
