package pl.isigmas.kaucjapp.deposit.service;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.deposit.DTO.ReviewRequestDTO;
import pl.isigmas.kaucjapp.deposit.exception.DepositMachineNotFoundException;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineReview;
import pl.isigmas.kaucjapp.deposit.model.Rating;
import pl.isigmas.kaucjapp.deposit.repository.DepositMachineRepository;
import pl.isigmas.kaucjapp.deposit.repository.DepositMachineReviewRepository;
import pl.isigmas.kaucjapp.deposit.repository.RatingRepository;
import pl.isigmas.kaucjapp.deposit.repository.RetailNetworkRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingService {

    private final DepositMachineRepository depositMachineRepository;
    private final RatingRepository ratingRepository;
    private final DepositMachineReviewRepository depositMachineReviewRepository;
    private final RetailNetworkRepository retailNetworkRepository;

    @Transactional
    public void createReview(Long id, Long userId, @Valid ReviewRequestDTO dto) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new DepositMachineNotFoundException(id));

        DepositMachineReview review = DepositMachineReview.builder()
                .depositMachineId(id)
                .reviewerId(userId)
                .score(dto.getScore())
                .comment(dto.getComment())
                .build();
        depositMachineReviewRepository.save(review);

        BigDecimal currentAvg = rating.getAvgScore();
        int oldCount = rating.getFeedbackCount();
        int newCount = oldCount + 1;

        BigDecimal currentTotalSum = currentAvg.multiply(BigDecimal.valueOf(oldCount));
        BigDecimal newTotalSum = currentTotalSum.add(dto.getScore());
        BigDecimal newAvg = newTotalSum.divide(BigDecimal.valueOf(newCount), 2, RoundingMode.HALF_UP);

        rating.setAvgScore(newAvg);
        rating.setFeedbackCount(newCount);

        log.info("New avg for deposit machine with id {}: {} (feedback count: {})", id, newAvg, newCount);

    }

}
