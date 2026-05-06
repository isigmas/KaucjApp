package pl.isigmas.kaucjapp.offers.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.offers.model.OfferComplaint;

@Repository
public interface ComplaintRepository extends JpaRepository<OfferComplaint, Long> {

}
