package pl.isigmas.kaucjapp.deposit.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.deposit.DTO.ReviewRequestDTO;
import pl.isigmas.kaucjapp.deposit.DTO.ReviewResponseDTO;
import pl.isigmas.kaucjapp.deposit.DTO.UpdateReviewDTO;
import pl.isigmas.kaucjapp.deposit.exception.DepositMachineNotFoundException;
import pl.isigmas.kaucjapp.deposit.exception.ReviewForbiddenException;
import pl.isigmas.kaucjapp.deposit.exception.ReviewNotFoundException;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineReview;
import pl.isigmas.kaucjapp.deposit.model.Rating;
import pl.isigmas.kaucjapp.deposit.repository.DepositMachineReviewRepository;
import pl.isigmas.kaucjapp.deposit.repository.RatingRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
                .reviewerUsername(dto.getReviewerUsername())
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

    @Transactional
    public void updateReview(Long reviewId, Long reviewerId, UpdateReviewDTO request) {
        DepositMachineReview review = depositMachineReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        if (review.getReviewerId() == null || !review.getReviewerId().equals(reviewerId)) {
            throw new ReviewForbiddenException("Only the author of the review can edit it");
        }

        if (request.getScore() != null) {
            Rating rating = ratingRepository.findById(review.getDepositMachineId())
                    .orElseThrow(() -> new DepositMachineNotFoundException(review.getDepositMachineId()));

            BigDecimal currentAvg = rating.getAvgScore();
            int count = rating.getFeedbackCount();

            if (count > 0) {
                BigDecimal currentTotalSum = currentAvg.multiply(BigDecimal.valueOf(count));
                BigDecimal newTotalSum = currentTotalSum.subtract(review.getScore()).add(request.getScore());
                BigDecimal newAvg = newTotalSum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
                rating.setAvgScore(newAvg);
            }

            review.setScore(request.getScore());
        }

        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }

        depositMachineReviewRepository.save(review);

        log.info("Updated review {} for deposit machine {}", reviewId, review.getDepositMachineId());
    }

    @Transactional
    public void deleteReview(Long reviewId, Long reviewerId) {
        DepositMachineReview review = depositMachineReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        if (review.getReviewerId() == null || !review.getReviewerId().equals(reviewerId)) {
            throw new ReviewForbiddenException("Only the author of the review can delete it");
        }

        Rating rating = ratingRepository.findById(review.getDepositMachineId())
                .orElseThrow(() -> new DepositMachineNotFoundException(review.getDepositMachineId()));

        BigDecimal currentAvg = rating.getAvgScore();
        int oldCount = rating.getFeedbackCount();
        int newCount = oldCount - 1;

        BigDecimal currentTotalSum = currentAvg.multiply(BigDecimal.valueOf(oldCount));
        BigDecimal newTotalSum = currentTotalSum.subtract(review.getScore());

        BigDecimal newAvg;
        if (newCount <= 0) {
            newAvg = BigDecimal.ZERO;
        } else {
            newAvg = newTotalSum.divide(BigDecimal.valueOf(newCount), 2, RoundingMode.HALF_UP);
        }

        rating.setAvgScore(newAvg);
        rating.setFeedbackCount(Math.max(newCount, 0));

        depositMachineReviewRepository.delete(review);

        log.info("Deleted review {} for deposit machine {} (new avg: {}, count: {})",
                reviewId, review.getDepositMachineId(), newAvg, Math.max(newCount, 0));
    }


    private ReviewResponseDTO mapReviewToDTO(DepositMachineReview review) {
        return ReviewResponseDTO.builder()
                .reviewId(review.getId())
                .reviewerId(review.getReviewerId())
                .reviewerUsername(review.getReviewerUsername())
                .score(review.getScore())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public Optional<ReviewResponseDTO> getReviewForDepositMachine(Long reviewerId, Long depositMachineId) {
        log.info("Fetching review for reviewer {} and deposit machine {}", reviewerId, depositMachineId);

        return depositMachineReviewRepository.findByReviewerIdAndDepositMachineId(reviewerId, depositMachineId)
                .map(this::mapReviewToDTO);
    }

    @Transactional
    public void deleteUserInfo(Long userId) {
        log.info("Anonymizing reviews in deposit-service for deleted user {}", userId);
        depositMachineReviewRepository.anonymizeUserReviews(userId);
    }
}
