package pl.isigmas.kaucjapp.users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.users.model.Rating;

public interface RatingRepository extends JpaRepository<Rating, Long> {
}