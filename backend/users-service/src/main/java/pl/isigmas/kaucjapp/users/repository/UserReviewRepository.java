package pl.isigmas.kaucjapp.users.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.users.model.UserReview;

public interface UserReviewRepository extends JpaRepository<UserReview, Long> {

    Page<UserReview> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId, Pageable pageable);
}
