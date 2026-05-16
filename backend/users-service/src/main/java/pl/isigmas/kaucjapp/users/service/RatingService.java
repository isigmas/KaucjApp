package pl.isigmas.kaucjapp.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.users.DTO.RatingDTO;
import pl.isigmas.kaucjapp.users.DTO.ReviewRequestDTO;
import pl.isigmas.kaucjapp.users.DTO.ReviewResponseDTO;
import pl.isigmas.kaucjapp.users.exception.RatingNotFoundException;
import pl.isigmas.kaucjapp.users.exception.SelfRatingForbiddenException;
import pl.isigmas.kaucjapp.users.exception.UserNotFoundException;
import pl.isigmas.kaucjapp.users.model.Rating;
import pl.isigmas.kaucjapp.users.model.User;
import pl.isigmas.kaucjapp.users.model.UserReview;
import pl.isigmas.kaucjapp.users.repository.RatingRepository;
import pl.isigmas.kaucjapp.users.repository.UserRepository;
import pl.isigmas.kaucjapp.users.repository.UserReviewRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;

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
    public Page<ReviewResponseDTO> getUserReviews(Long userId, Pageable pageable) {
        if (!ratingRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }

        return userReviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapReviewToDTO);
    }

    @Transactional(readOnly = true)
    public RatingDTO getRatingDTO(Long userId) {
        return ratingRepository.findById(userId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RatingNotFoundException(userId));
    }

    private ReviewResponseDTO mapReviewToDTO(UserReview review) {
        String reviewerUsername = null;
        if (review.getReviewerId() != null) {
            reviewerUsername = userRepository.findById(review.getReviewerId())
                    .map(User::getUsername)
                    .orElse(null);
        }

        return ReviewResponseDTO.builder()
                .reviewId(review.getId())
                .reviewerId(review.getReviewerId())
                .reviewerUsername(reviewerUsername)
                .score(review.getScore())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private RatingDTO mapToDTO(Rating rating) {
        RatingDTO dto = new RatingDTO();
        dto.setUserId(rating.getUserId());
        dto.setAvgScore(rating.getAvgScore());
        dto.setFeedbackCount(rating.getFeedbackCount());
        return dto;
    }
}
