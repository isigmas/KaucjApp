package pl.isigmas.kaucjapp.deposit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.deposit.model.DepositMachine;
import pl.isigmas.kaucjapp.deposit.model.Rating;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
}
