package pl.isigmas.kaucjapp.deposit.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.common.logger.Logger;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final DepositMachineReviewRepository depositMachineReviewRepository;
    private final Logger logger;

    @Transactional
    public void createReview(Long depositMachineId, Long reviewerId, @Valid ReviewRequestDTO dto) {
        Rating rating = ratingRepository.findById(depositMachineId)
                .orElseThrow(() -> {
                    logger.warn("Deposit machine not found, ID: %d".formatted(depositMachineId));
                    return new DepositMachineNotFoundException(depositMachineId);
                });

        if (depositMachineReviewRepository.existsByReviewerIdAndDepositMachineId(reviewerId, depositMachineId)) {
            logger.warn("Duplicate review forbidden for machine ID: %d by user ID: %d".formatted(depositMachineId, reviewerId));
            throw new ReviewForbiddenException("Review for this machine already exists for this user");
        }

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

        logger.important("Review created for deposit machine ID: %d by user ID: %d (new avg: %s, count: %d)".formatted(
                depositMachineId, reviewerId, newAvg, newCount));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getDepositMachineReviews(Long depositMachineId, Long currentUserId) {
        if (!ratingRepository.existsById(depositMachineId)) {
            logger.warn("Deposit machine not found, ID: %d".formatted(depositMachineId));
            throw new DepositMachineNotFoundException(depositMachineId);
        }

        return depositMachineReviewRepository
                .findByDepositMachineIdOrderByCreatedAtDesc(depositMachineId)
                .stream()
                .filter(review -> currentUserId == null || !currentUserId.equals(review.getReviewerId()))
                .map(this::mapReviewToDTO)
                .toList();
    }

    @Transactional
    public void updateReview(Long reviewId, Long reviewerId, UpdateReviewDTO request) {
        DepositMachineReview review = depositMachineReviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    logger.warn("Review not found, ID: %d".formatted(reviewId));
                    return new ReviewNotFoundException(reviewId);
                });

        if (review.getReviewerId() == null || !review.getReviewerId().equals(reviewerId)) {
            logger.warn("Review update forbidden for review ID: %d by user ID: %d".formatted(reviewId, reviewerId));
            throw new ReviewForbiddenException("Only the author of the review can edit it");
        }

        if (request.getScore() != null) {
            Rating rating = ratingRepository.findById(review.getDepositMachineId())
                    .orElseThrow(() -> {
                        logger.warn("Deposit machine not found, ID: %d".formatted(review.getDepositMachineId()));
                        return new DepositMachineNotFoundException(review.getDepositMachineId());
                    });

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

        logger.important("Review updated, ID: %d for deposit machine ID: %d".formatted(reviewId, review.getDepositMachineId()));
    }

    @Transactional
    public void deleteReview(Long reviewId, Long reviewerId) {
        DepositMachineReview review = depositMachineReviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    logger.warn("Review not found, ID: %d".formatted(reviewId));
                    return new ReviewNotFoundException(reviewId);
                });

        if (review.getReviewerId() == null || !review.getReviewerId().equals(reviewerId)) {
            logger.warn("Review delete forbidden for review ID: %d by user ID: %d".formatted(reviewId, reviewerId));
            throw new ReviewForbiddenException("Only the author of the review can delete it");
        }

        Rating rating = ratingRepository.findById(review.getDepositMachineId())
                .orElseThrow(() -> {
                    logger.warn("Deposit machine not found, ID: %d".formatted(review.getDepositMachineId()));
                    return new DepositMachineNotFoundException(review.getDepositMachineId());
                });

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

        logger.important("Review deleted, ID: %d for deposit machine ID: %d (new avg: %s, count: %d)".formatted(
                reviewId, review.getDepositMachineId(), newAvg, Math.max(newCount, 0)));
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
        logger.info("Checking review for user ID: %d and deposit machine ID: %d".formatted(reviewerId, depositMachineId));

        return depositMachineReviewRepository.findByReviewerIdAndDepositMachineId(reviewerId, depositMachineId)
                .map(this::mapReviewToDTO);
    }

    @Transactional
    public void deleteUserInfo(Long userId) {
        depositMachineReviewRepository.anonymizeUserReviews(userId);
        logger.important("Anonymized deposit reviews for deleted user ID: %d".formatted(userId));
    }
}
