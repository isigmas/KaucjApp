package pl.isigmas.kaucjapp.offers.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.offers.model.Complainant;
import pl.isigmas.kaucjapp.offers.model.OfferComplaint;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<OfferComplaint, Long> {
    @Query("SELECT c FROM OfferComplaint c JOIN FETCH c.offer ORDER BY c.id DESC")
    List<OfferComplaint> findAllWithOfferOrderByIdDesc();

    @Query("SELECT c FROM OfferComplaint c JOIN FETCH c.offer " +
            "WHERE c.offer.id = :offerId AND c.complainant = :complainant ORDER BY c.id DESC")
    List<OfferComplaint> findAllByOfferIdAndComplainantWithOfferOrderByIdDesc(
            @Param("offerId") Long offerId,
            @Param("complainant") Complainant complainant
    );

    List<OfferComplaint> findAllByOrderByIdDesc();

    List<OfferComplaint> findAllByOffer_IdAndComplainantOrderByIdDesc(Long offerId, Complainant complainant);
}
