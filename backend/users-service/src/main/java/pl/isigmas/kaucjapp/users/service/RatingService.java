package pl.isigmas.kaucjapp.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.RatingDTO;
import pl.isigmas.kaucjapp.users.DTO.ReviewRequestDTO;
import pl.isigmas.kaucjapp.users.DTO.ReviewResponseDTO;
import pl.isigmas.kaucjapp.users.DTO.UpdateReviewDTO;
import pl.isigmas.kaucjapp.users.exception.*;
import pl.isigmas.kaucjapp.users.model.Rating;
import pl.isigmas.kaucjapp.users.model.User;
import pl.isigmas.kaucjapp.users.model.UserReview;
import pl.isigmas.kaucjapp.users.repository.RatingRepository;
import pl.isigmas.kaucjapp.users.repository.UserRepository;
import pl.isigmas.kaucjapp.users.repository.UserReviewRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserReviewRepository userReviewRepository;
    private final UserRepository userRepository;
    private final Logger logger;

    @Transactional
    public void addReview(Long revieweeId, Long reviewerId, ReviewRequestDTO request) {
        if (revieweeId.equals(reviewerId)) {
            log.warn("Self-rating forbidden for user ID: {}", revieweeId);
            logger.warn("Self-rating forbidden for user ID: %d".formatted(revieweeId));
            throw new SelfRatingForbiddenException();
        }

        if (userReviewRepository.existsByReviewerIdAndOfferId(reviewerId, request.getOfferId())) {
            log.warn("Duplicate review for offer {} by reviewer ID: {}", request.getOfferId(), reviewerId);
            logger.warn(
                    "Duplicate review for offer %d by reviewer ID: %d".formatted(request.getOfferId(), reviewerId)
            );
            throw new ReviewForbiddenException("You've already rated this user for this offer");
        }

        Rating rating = ratingRepository.findById(revieweeId)
                .orElseThrow(() -> {
                    log.warn("User not found, ID: {}", revieweeId);
                    logger.warn("User not found, ID: %d".formatted(revieweeId));
                    return new UserNotFoundException(revieweeId);
                });

        UserReview review = UserReview.builder()
                .revieweeId(revieweeId)
                .reviewerId(reviewerId)
                .offerId(request.getOfferId())
                .score(request.getScore())
                .comment(request.getComment())
                .build();
        userReviewRepository.save(review);

        BigDecimal currentAvg = rating.getAvgScore();
        int oldCount = rating.getFeedbackCount();
        int newCount = oldCount + 1;

        BigDecimal currentTotalSum = currentAvg.multiply(BigDecimal.valueOf(oldCount));
        BigDecimal newTotalSum = currentTotalSum.add(request.getScore());
        BigDecimal newAvg = newTotalSum.divide(BigDecimal.valueOf(newCount), 2, RoundingMode.HALF_UP);

        rating.setAvgScore(newAvg);
        rating.setFeedbackCount(newCount);

        log.info("Review added for user ID: {} by reviewer ID: {} (score {}, offer {})",
                revieweeId, reviewerId, request.getScore(), request.getOfferId());
        logger.important(
                "Review added for user ID: %d by reviewer ID: %d (score %s, offer %d)"
                        .formatted(revieweeId, reviewerId, request.getScore(), request.getOfferId())
        );
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getUserReviews(Long userId) {
        if (!ratingRepository.existsById(userId)) {
            log.warn("User not found, ID: {}", userId);
            logger.warn("User not found, ID: %d".formatted(userId));
            throw new UserNotFoundException(userId);
        }

        List<UserReview> reviews = userReviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId);

        Set<Long> reviewerIds = reviews.stream()
                .map(UserReview::getReviewerId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> usernamesById = reviewerIds.isEmpty()
                ? Map.of()
                : userRepository.findAllById(reviewerIds).stream()
                        .collect(Collectors.toMap(User::getId, User::getUsername));

        return reviews.stream()
                .map(review -> mapReviewToDTO(review, usernamesById))
                .toList();
    }

    @Transactional
    public void updateReview(Long reviewId, Long reviewerId, UpdateReviewDTO request) {
        UserReview review = userReviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    log.warn("Review not found, ID: {}", reviewId);
                    logger.warn("Review not found, ID: %d".formatted(reviewId));
                    return new ReviewNotFoundException(reviewId);
                });

        if (review.getReviewerId() == null || !review.getReviewerId().equals(reviewerId)) {
            log.warn("Review edit forbidden for review ID: {} by user ID: {}", reviewId, reviewerId);
            logger.warn("Review edit forbidden for review ID: %d by user ID: %d".formatted(reviewId, reviewerId));
            throw new ReviewForbiddenException("Only the author of the review can edit it");
        }

        if (request.getScore() != null) {
            Rating rating = ratingRepository.findById(review.getRevieweeId())
                    .orElseThrow(() -> {
                        log.warn("User not found, ID: {}", review.getRevieweeId());
                        logger.warn("User not found, ID: %d".formatted(review.getRevieweeId()));
                        return new UserNotFoundException(review.getRevieweeId());
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
        userReviewRepository.save(review);

        log.info("Review updated, ID: {} by reviewer ID: {}", reviewId, reviewerId);
        logger.important("Review updated, ID: %d by reviewer ID: %d".formatted(reviewId, reviewerId));
    }

    @Transactional
    public void deleteReview(Long reviewId, Long reviewerId) {
        UserReview review = userReviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    log.warn("Review not found, ID: {}", reviewId);
                    logger.warn("Review not found, ID: %d".formatted(reviewId));
                    return new ReviewNotFoundException(reviewId);
                });

        if (review.getReviewerId() == null || !review.getReviewerId().equals(reviewerId)) {
            log.warn("Review delete forbidden for review ID: {} by user ID: {}", reviewId, reviewerId);
            logger.warn("Review delete forbidden for review ID: %d by user ID: %d".formatted(reviewId, reviewerId));
            throw new ReviewForbiddenException("Only the author of the review can delete it");
        }

        Rating rating = ratingRepository.findById(review.getRevieweeId())
                .orElseThrow(() -> {
                    log.warn("User not found, ID: {}", review.getRevieweeId());
                    logger.warn("User not found, ID: %d".formatted(review.getRevieweeId()));
                    return new UserNotFoundException(review.getRevieweeId());
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

        userReviewRepository.delete(review);

        log.info("Review deleted, ID: {} by reviewer ID: {}", reviewId, reviewerId);
        logger.important("Review deleted, ID: %d by reviewer ID: %d".formatted(reviewId, reviewerId));
    }

    @Transactional(readOnly = true)
    public ReviewResponseDTO getReview(Long reviewId) {
        UserReview review = userReviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    log.warn("Review not found, ID: {}", reviewId);
                    logger.warn("Review not found, ID: %d".formatted(reviewId));
                    return new ReviewNotFoundException(reviewId);
                });
        return mapReviewToDTO(review);
    }

    @Transactional(readOnly = true)
    public RatingDTO getRatingDTO(Long userId) {
        return ratingRepository.findById(userId)
                .map(this::mapToDTO)
                .orElseThrow(() -> {
                    log.warn("Rating not found for user ID: {}", userId);
                    logger.warn("Rating not found for user ID: %d".formatted(userId));
                    return new RatingNotFoundException(userId);
                });
    }

    @Transactional(readOnly = true)
    public Optional<ReviewResponseDTO> getReviewForOffer(Long reviewerId, Long offerId) {
        return userReviewRepository.findByReviewerIdAndOfferId(reviewerId, offerId)
                .map(this::mapReviewToDTO);
    }

    private ReviewResponseDTO mapReviewToDTO(UserReview review, Map<Long, String> usernamesById) {
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

    private ReviewResponseDTO mapReviewToDTO(UserReview review) {
        Map<Long, String> usernamesById = review.getReviewerId() == null
                ? Map.of()
                : userRepository.findById(review.getReviewerId())
                        .map(u -> Map.of(u.getId(), u.getUsername()))
                        .orElseGet(Map::of);
        return mapReviewToDTO(review, usernamesById);
    }

    private RatingDTO mapToDTO(Rating rating) {
        RatingDTO dto = new RatingDTO();
        dto.setUserId(rating.getUserId());
        dto.setAvgScore(rating.getAvgScore());
        dto.setFeedbackCount(rating.getFeedbackCount());
        return dto;
    }
}
