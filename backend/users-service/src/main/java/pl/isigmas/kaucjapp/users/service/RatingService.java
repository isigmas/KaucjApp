package pl.isigmas.kaucjapp.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final UserReviewRepository userReviewRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addReview(Long revieweeId, Long reviewerId, ReviewRequestDTO request) {
        log.info("Adding review with score {} for user ID: {} by reviewer ID: {}",
                request.getScore(), revieweeId, reviewerId);

        if (revieweeId.equals(reviewerId)) {
            throw new SelfRatingForbiddenException();
        }

        Rating rating = ratingRepository.findById(revieweeId)
                .orElseThrow(() -> new UserNotFoundException(revieweeId));

        UserReview review = UserReview.builder()
                .revieweeId(revieweeId)
                .reviewerId(reviewerId)
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

        log.info("New avg for user {}: {} (feedback count: {})", revieweeId, newAvg, newCount);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getUserReviews(Long userId) {
        if (!ratingRepository.existsById(userId)) {
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
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        if (review.getReviewerId() == null || !review.getReviewerId().equals(reviewerId)) {
            throw new ReviewForbiddenException("Only the author of the review can edit it");
        }

        if (request.getScore() != null) {
            Rating rating = ratingRepository.findById(review.getRevieweeId())
                    .orElseThrow(() -> new UserNotFoundException(review.getRevieweeId()));

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
    }

    @Transactional
    public void deleteReview(Long reviewId, Long reviewerId) {
        UserReview review = userReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        if (review.getReviewerId() == null || !review.getReviewerId().equals(reviewerId)) {
            throw new ReviewForbiddenException("Only the author of the review can delete it");
        }

        Rating rating = ratingRepository.findById(review.getRevieweeId())
                .orElseThrow(() -> new UserNotFoundException(review.getRevieweeId()));

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
    }

    @Transactional(readOnly = true)
    public ReviewResponseDTO getReview(Long reviewId) {
        UserReview review = userReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));
        return mapReviewToDTO(review);
    }

    @Transactional(readOnly = true)
    public RatingDTO getRatingDTO(Long userId) {
        return ratingRepository.findById(userId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RatingNotFoundException(userId));
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
