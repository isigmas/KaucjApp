package pl.isigmas.kaucjapp.offers.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.offers.model.Complainant;
import pl.isigmas.kaucjapp.offers.model.OfferComplaint;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<OfferComplaint, Long> {
    List<OfferComplaint> findAllByOrderByIdDesc();

    List<OfferComplaint> findAllByOffer_IdAndComplainantOrderByIdDesc(Long offerId, Complainant complainant);
}
