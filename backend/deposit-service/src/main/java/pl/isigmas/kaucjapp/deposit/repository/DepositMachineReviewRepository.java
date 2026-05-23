package pl.isigmas.kaucjapp.deposit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineReview;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepositMachineReviewRepository  extends JpaRepository<DepositMachineReview, Long> {

    List<DepositMachineReview> findByDepositMachineIdOrderByCreatedAtDesc(Long depositMachineId);

    Optional<DepositMachineReview> findByReviewerIdAndDepositMachineId(Long reviewerId, Long depositMachineId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE DepositMachineReview d SET d.reviewerUsername = CONCAT('deleted-user-', :userId) WHERE d.reviewerId = :userId")
    void anonymizeUserReviews(@Param("userId") Long userId);


}
