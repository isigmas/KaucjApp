package pl.isigmas.kaucjapp.users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.users.model.UserReview;

import java.util.List;

public interface UserReviewRepository extends JpaRepository<UserReview, Long> {

    List<UserReview> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);

    boolean existsByReviewerIdAndOfferId(Long reviewerId, Long offerId);
}
