package pl.isigmas.kaucjapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.model.Rating;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
}