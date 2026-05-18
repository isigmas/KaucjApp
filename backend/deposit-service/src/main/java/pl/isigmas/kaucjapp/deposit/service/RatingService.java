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
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final DepositMachineReviewRepository depositMachineReviewRepository;
    private final ReviewerUsernameResolver reviewerUsernameResolver;

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

        List<DepositMachineReview> reviews =
                depositMachineReviewRepository.findByDepositMachineIdOrderByCreatedAtDesc(depositMachineId);

        Set<Long> reviewerIds = reviews.stream()
                .map(DepositMachineReview::getReviewerId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> usernamesById = reviewerUsernameResolver.resolveUsernames(reviewerIds);

        return reviews.stream()
                .map(review -> mapReviewToDTO(review, usernamesById))
                .toList();
    }

    private ReviewResponseDTO mapReviewToDTO(DepositMachineReview review, Map<Long, String> usernamesById) {
        String reviewerUsername = review.getReviewerId() == null
                ? null
                : usernamesById.get(review.getReviewerId());

        return ReviewResponseDTO.builder()
                .reviewId(review.getId())
                .reviewerId(review.getReviewerId())
                .reviewerUsername(reviewerUsername)
                .score(review.getScore())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
