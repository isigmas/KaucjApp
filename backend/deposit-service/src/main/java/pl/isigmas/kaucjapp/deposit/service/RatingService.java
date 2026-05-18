package pl.isigmas.kaucjapp.deposit.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.deposit.DTO.ReviewRequestDTO;
import pl.isigmas.kaucjapp.deposit.DTO.ReviewResponseDTO;
import pl.isigmas.kaucjapp.deposit.exception.DepositMachineNotFoundException;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineReview;
import pl.isigmas.kaucjapp.deposit.model.Rating;
import pl.isigmas.kaucjapp.deposit.repository.DepositMachineReviewRepository;
import pl.isigmas.kaucjapp.deposit.repository.RatingRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final DepositMachineReviewRepository depositMachineReviewRepository;

    @Transactional
    public void createReview(Long depositMachineId, Long reviewerId, @Valid ReviewRequestDTO dto) {
        Rating rating = ratingRepository.findById(depositMachineId)
                .orElseThrow(() -> new DepositMachineNotFoundException(depositMachineId));

        DepositMachineReview review = DepositMachineReview.builder()
                .depositMachineId(depositMachineId)
                .reviewerId(reviewerId)
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

        log.info("New avg for deposit machine {}: {} (feedback count: {})",
                depositMachineId, newAvg, newCount);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getDepositMachineReviews(Long depositMachineId) {
        if (!ratingRepository.existsById(depositMachineId)) {
            throw new DepositMachineNotFoundException(depositMachineId);
        }

        return depositMachineReviewRepository
                .findByDepositMachineIdOrderByCreatedAtDesc(depositMachineId)
                .stream()
                .map(this::mapReviewToDTO)
                .toList();
    }

    private ReviewResponseDTO mapReviewToDTO(DepositMachineReview review) {
        return ReviewResponseDTO.builder()
                .reviewId(review.getId())
                .reviewerId(review.getReviewerId())
                .score(review.getScore())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
