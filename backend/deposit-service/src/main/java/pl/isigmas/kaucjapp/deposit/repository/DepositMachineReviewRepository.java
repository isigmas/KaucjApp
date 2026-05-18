package pl.isigmas.kaucjapp.deposit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineReview;

import java.util.List;

@Repository
public interface DepositMachineReviewRepository  extends JpaRepository<DepositMachineReview, Long> {

    List<DepositMachineReview> findByDepositMachineIdOrderByCreatedAtDesc(Long depositMachineId);

}
