package pl.isigmas.kaucjapp.users.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.users.DTO.RatingDTO;
import pl.isigmas.kaucjapp.users.DTO.ReviewRequestDTO;
import pl.isigmas.kaucjapp.users.DTO.ReviewResponseDTO;
import pl.isigmas.kaucjapp.users.DTO.UpdateReviewDTO;
import pl.isigmas.kaucjapp.users.exception.RatingNotFoundException;
import pl.isigmas.kaucjapp.users.exception.ReviewForbiddenException;
import pl.isigmas.kaucjapp.users.exception.ReviewNotFoundException;
import pl.isigmas.kaucjapp.users.exception.SelfRatingForbiddenException;
import pl.isigmas.kaucjapp.users.exception.UserNotFoundException;
import pl.isigmas.kaucjapp.users.model.Rating;
import pl.isigmas.kaucjapp.users.model.User;
import pl.isigmas.kaucjapp.users.model.UserReview;
import pl.isigmas.kaucjapp.users.repository.RatingRepository;
import pl.isigmas.kaucjapp.users.repository.UserRepository;
import pl.isigmas.kaucjapp.users.repository.UserReviewRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;
    @Mock
    private UserReviewRepository userReviewRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RatingService ratingService;

    // ---------- addReview ----------

    @Test
    void addReview_firstReview_setsAvgToScoreAndCountToOne() {
        // Given
        Long revieweeId = 10L;
        Long reviewerId = 20L;
        Rating rating = ratingOf(revieweeId, BigDecimal.ZERO, 0);
        ReviewRequestDTO req = reviewReq(new BigDecimal("4"), "ok");

        when(userReviewRepository.existsByReviewerIdAndOfferId(reviewerId, req.getOfferId())).thenReturn(false);
        when(ratingRepository.findById(revieweeId)).thenReturn(Optional.of(rating));

        // When
        ratingService.addReview(revieweeId, reviewerId, req);

        // Then
        ArgumentCaptor<UserReview> savedReview = ArgumentCaptor.forClass(UserReview.class);
        verify(userReviewRepository).save(savedReview.capture());
        UserReview review = savedReview.getValue();
        assertThat(review.getRevieweeId()).isEqualTo(revieweeId);
        assertThat(review.getReviewerId()).isEqualTo(reviewerId);
        assertThat(review.getScore()).isEqualByComparingTo("4");
        assertThat(review.getComment()).isEqualTo("ok");
        assertThat(review.getOfferId()).isEqualTo(100L);

        assertThat(rating.getFeedbackCount()).isEqualTo(1);
        assertThat(rating.getAvgScore()).isEqualByComparingTo("4.00");
    }

    @Test
    void addReview_subsequentReview_updatesRunningAverage() {
        // Given: current avg=4.00 over 2 reviews → new score 5 → expected avg=(8+5)/3=4.33
        Long revieweeId = 1L;
        Long reviewerId = 2L;
        Rating rating = ratingOf(revieweeId, new BigDecimal("4.00"), 2);
        ReviewRequestDTO req = reviewReq(new BigDecimal("5"), null);
        when(userReviewRepository.existsByReviewerIdAndOfferId(reviewerId, req.getOfferId())).thenReturn(false);
        when(ratingRepository.findById(revieweeId)).thenReturn(Optional.of(rating));

        // When
        ratingService.addReview(revieweeId, reviewerId, req);

        // Then
        assertThat(rating.getFeedbackCount()).isEqualTo(3);
        assertThat(rating.getAvgScore()).isEqualByComparingTo("4.33");
        verify(userReviewRepository).save(any(UserReview.class));
    }

    @Test
    void addReview_selfReview_throwsSelfRatingForbidden_andSavesNothing() {
        // Given
        Long me = 7L;

        // When / Then
        assertThatThrownBy(() ->
                ratingService.addReview(me, me, reviewReq(new BigDecimal("3"), "self")))
                .isInstanceOf(SelfRatingForbiddenException.class);

        verifyNoInteractions(userReviewRepository, userRepository);
        verify(ratingRepository, never()).findById(any());
    }

    @Test
    void addReview_revieweeMissing_throwsUserNotFound_andDoesNotPersistReview() {
        // Given
        Long revieweeId = 999L;
        Long reviewerId = 1L;
        ReviewRequestDTO req = reviewReq(new BigDecimal("3"), null);
        when(userReviewRepository.existsByReviewerIdAndOfferId(reviewerId, req.getOfferId())).thenReturn(false);
        when(ratingRepository.findById(revieweeId)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> ratingService.addReview(revieweeId, reviewerId, req))
                .isInstanceOf(UserNotFoundException.class);

        verify(userReviewRepository, never()).save(any());
    }

    @Test
    void addReview_alreadyReviewedOffer_throwsReviewForbidden_andDoesNotPersist() {
        Long revieweeId = 10L;
        Long reviewerId = 20L;
        ReviewRequestDTO req = reviewReq(new BigDecimal("4"), "dup", 55L);

        when(userReviewRepository.existsByReviewerIdAndOfferId(reviewerId, 55L)).thenReturn(true);

        assertThatThrownBy(() -> ratingService.addReview(revieweeId, reviewerId, req))
                .isInstanceOf(ReviewForbiddenException.class)
                .hasMessageContaining("already rated");

        verify(ratingRepository, never()).findById(any());
        verify(userReviewRepository, never()).save(any());
    }

    // ---------- getUserReviews ----------

    @Test
    void getUserReviews_returnsListMappedWithUsernames_usingBatchLookup() {
        // Given
        Long revieweeId = 100L;

        UserReview r1 = buildReview(1L, revieweeId, 11L, new BigDecimal("5"), "great");
        UserReview r2 = buildReview(2L, revieweeId, 12L, new BigDecimal("3"), "meh");
        // duplicate reviewer to ensure dedup before findAllById
        UserReview r3 = buildReview(3L, revieweeId, 11L, new BigDecimal("4"), "ok again");

        User u11 = userOf(11L, "alice");
        User u12 = userOf(12L, "bob");

        when(ratingRepository.existsById(revieweeId)).thenReturn(true);
        when(userReviewRepository.findByRevieweeIdOrderByCreatedAtDesc(revieweeId))
                .thenReturn(List.of(r1, r2, r3));
        when(userRepository.findAllById(anySet())).thenReturn(List.of(u11, u12));

        // When
        List<ReviewResponseDTO> result = ratingService.getUserReviews(revieweeId);

        // Then
        assertThat(result).hasSize(3);
        assertThat(result)
                .extracting(ReviewResponseDTO::getReviewId, ReviewResponseDTO::getReviewerUsername)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple(1L, "alice"),
                        org.assertj.core.groups.Tuple.tuple(2L, "bob"),
                        org.assertj.core.groups.Tuple.tuple(3L, "alice"));

        // Batch fetch happened exactly once with deduplicated ids
        ArgumentCaptor<Set<Long>> idsCaptor = ArgumentCaptor.forClass(Set.class);
        verify(userRepository, times(1)).findAllById(idsCaptor.capture());
        assertThat(idsCaptor.getValue()).containsExactlyInAnyOrder(11L, 12L);
        verify(userRepository, never()).findById(any());
    }

    @Test
    void getUserReviews_unknownUser_throwsUserNotFound() {
        // Given
        when(ratingRepository.existsById(404L)).thenReturn(false);

        // When / Then
        assertThatThrownBy(() -> ratingService.getUserReviews(404L))
                .isInstanceOf(UserNotFoundException.class);

        verifyNoInteractions(userReviewRepository, userRepository);
    }

    @Test
    void getUserReviews_reviewWithNullReviewerId_mapsUsernameAsNull_andSkipsLookupBatch() {
        // Given
        Long revieweeId = 100L;
        UserReview anonymized = buildReview(7L, revieweeId, null, new BigDecimal("2"), "ghost");

        when(ratingRepository.existsById(revieweeId)).thenReturn(true);
        when(userReviewRepository.findByRevieweeIdOrderByCreatedAtDesc(revieweeId))
                .thenReturn(List.of(anonymized));

        // When
        List<ReviewResponseDTO> result = ratingService.getUserReviews(revieweeId);

        // Then
        assertThat(result).singleElement()
                .satisfies(dto -> {
                    assertThat(dto.getReviewerId()).isNull();
                    assertThat(dto.getReviewerUsername()).isNull();
                });
        // No reviewer ids -> findAllById should not be invoked at all
        verify(userRepository, never()).findAllById(any());
    }

    // ---------- updateReview ----------

    @Test
    void updateReview_authorChangesScoreAndComment_recomputesAverageInPlace() {
        // Given: 2 reviews, avg=4.00. Author changes own score from 4 to 5.
        // Expected: total=(4+4)=8, new total=8-4+5=9, new avg=9/2=4.50
        Long reviewId = 1L;
        Long reviewerId = 20L;
        Long revieweeId = 10L;
        UserReview review = buildReview(reviewId, revieweeId, reviewerId, new BigDecimal("4"), "old");
        Rating rating = ratingOf(revieweeId, new BigDecimal("4.00"), 2);

        UpdateReviewDTO req = new UpdateReviewDTO();
        req.setScore(new BigDecimal("5"));
        req.setComment("better");

        when(userReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        when(ratingRepository.findById(revieweeId)).thenReturn(Optional.of(rating));

        // When
        ratingService.updateReview(reviewId, reviewerId, req);

        // Then
        assertThat(review.getScore()).isEqualByComparingTo("5");
        assertThat(review.getComment()).isEqualTo("better");
        assertThat(rating.getAvgScore()).isEqualByComparingTo("4.50");
        assertThat(rating.getFeedbackCount()).isEqualTo(2);
        verify(userReviewRepository).save(review);
    }

    @Test
    void updateReview_emptyPayload_isNoOpAndDoesNotTouchRating() {
        // Given
        Long reviewId = 1L;
        Long reviewerId = 20L;
        UserReview review = buildReview(reviewId, 10L, reviewerId, new BigDecimal("3"), "orig");

        when(userReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        // When
        ratingService.updateReview(reviewId, reviewerId, new UpdateReviewDTO());

        // Then
        assertThat(review.getScore()).isEqualByComparingTo("3");
        assertThat(review.getComment()).isEqualTo("orig");
        verify(ratingRepository, never()).findById(any());
        verify(userReviewRepository).save(review);
    }

    @Test
    void updateReview_byOtherUser_throwsReviewForbidden() {
        // Given
        Long reviewId = 1L;
        UserReview review = buildReview(reviewId, 10L, 20L /* author */, new BigDecimal("3"), "x");
        when(userReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        // When / Then
        assertThatThrownBy(() ->
                ratingService.updateReview(reviewId, 99L /* intruder */, new UpdateReviewDTO()))
                .isInstanceOf(ReviewForbiddenException.class);

        verify(userReviewRepository, never()).save(any());
    }

    @Test
    void updateReview_nullReviewerId_throwsReviewForbidden_andDoesNotNpe() {
        // Given: ON DELETE SET NULL leaves reviewer_id = null
        Long reviewId = 1L;
        UserReview review = buildReview(reviewId, 10L, null, new BigDecimal("3"), "anon");
        when(userReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        // When / Then
        assertThatThrownBy(() ->
                ratingService.updateReview(reviewId, 20L, new UpdateReviewDTO()))
                .isInstanceOf(ReviewForbiddenException.class);
    }

    @Test
    void updateReview_missingReview_throwsReviewNotFound() {
        when(userReviewRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                ratingService.updateReview(42L, 1L, new UpdateReviewDTO()))
                .isInstanceOf(ReviewNotFoundException.class);
    }

    // ---------- deleteReview ----------

    @Test
    void deleteReview_authorDeletes_recomputesAverageAndDecrementsCount() {
        // Given: 2 reviews, avg=4.00 (sum=8). Delete a score=3 → newSum=5, newCount=1, newAvg=5.00
        Long reviewId = 1L;
        Long reviewerId = 20L;
        Long revieweeId = 10L;
        UserReview review = buildReview(reviewId, revieweeId, reviewerId, new BigDecimal("3"), "x");
        Rating rating = ratingOf(revieweeId, new BigDecimal("4.00"), 2);

        when(userReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        when(ratingRepository.findById(revieweeId)).thenReturn(Optional.of(rating));

        // When
        ratingService.deleteReview(reviewId, reviewerId);

        // Then
        assertThat(rating.getFeedbackCount()).isEqualTo(1);
        assertThat(rating.getAvgScore()).isEqualByComparingTo("5.00");
        verify(userReviewRepository).delete(review);
    }

    @Test
    void deleteReview_lastReview_setsAverageToZero_andCountToZero() {
        // Given
        Long reviewId = 1L;
        Long reviewerId = 20L;
        Long revieweeId = 10L;
        UserReview review = buildReview(reviewId, revieweeId, reviewerId, new BigDecimal("5"), "x");
        Rating rating = ratingOf(revieweeId, new BigDecimal("5.00"), 1);

        when(userReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        when(ratingRepository.findById(revieweeId)).thenReturn(Optional.of(rating));

        // When
        ratingService.deleteReview(reviewId, reviewerId);

        // Then
        assertThat(rating.getFeedbackCount()).isZero();
        assertThat(rating.getAvgScore()).isEqualByComparingTo("0");
    }

    @Test
    void deleteReview_byOtherUser_throwsReviewForbidden_andDoesNotDelete() {
        Long reviewId = 1L;
        UserReview review = buildReview(reviewId, 10L, 20L, new BigDecimal("3"), "x");
        when(userReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> ratingService.deleteReview(reviewId, 99L))
                .isInstanceOf(ReviewForbiddenException.class);

        verify(userReviewRepository, never()).delete(any());
    }

    @Test
    void deleteReview_nullReviewerId_throwsReviewForbidden() {
        Long reviewId = 1L;
        UserReview review = buildReview(reviewId, 10L, null, new BigDecimal("3"), "anon");
        when(userReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> ratingService.deleteReview(reviewId, 20L))
                .isInstanceOf(ReviewForbiddenException.class);
    }

    @Test
    void deleteReview_missingReview_throwsReviewNotFound() {
        when(userReviewRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ratingService.deleteReview(42L, 1L))
                .isInstanceOf(ReviewNotFoundException.class);
    }

    // ---------- getReview ----------

    @Test
    void getReview_existing_returnsDtoWithReviewerUsername() {
        // Given
        UserReview review = buildReview(5L, 10L, 11L, new BigDecimal("4"), "ok");
        when(userReviewRepository.findById(5L)).thenReturn(Optional.of(review));
        when(userRepository.findById(11L)).thenReturn(Optional.of(userOf(11L, "alice")));

        // When
        ReviewResponseDTO dto = ratingService.getReview(5L);

        // Then
        assertThat(dto.getReviewId()).isEqualTo(5L);
        assertThat(dto.getReviewerUsername()).isEqualTo("alice");
        assertThat(dto.getScore()).isEqualByComparingTo("4");
    }

    @Test
    void getReview_missing_throwsReviewNotFound() {
        when(userReviewRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ratingService.getReview(404L))
                .isInstanceOf(ReviewNotFoundException.class);
    }

    // ---------- getRatingDTO ----------

    @Test
    void getRatingDTO_existing_returnsMappedDto() {
        Rating rating = ratingOf(10L, new BigDecimal("3.50"), 4);
        when(ratingRepository.findById(10L)).thenReturn(Optional.of(rating));

        RatingDTO dto = ratingService.getRatingDTO(10L);

        assertThat(dto.getUserId()).isEqualTo(10L);
        assertThat(dto.getAvgScore()).isEqualByComparingTo("3.50");
        assertThat(dto.getFeedbackCount()).isEqualTo(4);
    }

    @Test
    void getRatingDTO_missing_throwsRatingNotFound() {
        when(ratingRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ratingService.getRatingDTO(10L))
                .isInstanceOf(RatingNotFoundException.class);
    }

    // ---------- getReviewForOffer ----------

    @Test
    void getReviewForOffer_whenReviewExists_returnsMappedDto() {
        UserReview review = buildReview(5L, 10L, 20L, new BigDecimal("4"), "nice");

        when(userReviewRepository.findByReviewerIdAndOfferId(20L, 55L)).thenReturn(Optional.of(review));
        when(userRepository.findById(20L)).thenReturn(Optional.of(userOf(20L, "alice")));

        Optional<ReviewResponseDTO> result = ratingService.getReviewForOffer(20L, 55L);

        assertThat(result).isPresent();
        assertThat(result.get().getReviewId()).isEqualTo(5L);
        assertThat(result.get().getReviewerId()).isEqualTo(20L);
        assertThat(result.get().getReviewerUsername()).isEqualTo("alice");
        assertThat(result.get().getScore()).isEqualByComparingTo("4");
        assertThat(result.get().getComment()).isEqualTo("nice");
    }

    @Test
    void getReviewForOffer_whenNoReview_returnsEmpty() {
        when(userReviewRepository.findByReviewerIdAndOfferId(20L, 55L)).thenReturn(Optional.empty());

        assertThat(ratingService.getReviewForOffer(20L, 55L)).isEmpty();
    }

    // ---------- helpers ----------

    private static ReviewRequestDTO reviewReq(BigDecimal score, String comment) {
        return reviewReq(score, comment, 100L);
    }

    private static ReviewRequestDTO reviewReq(BigDecimal score, String comment, Long offerId) {
        ReviewRequestDTO dto = new ReviewRequestDTO();
        dto.setScore(score);
        dto.setComment(comment);
        dto.setOfferId(offerId);
        return dto;
    }

    private static Rating ratingOf(Long userId, BigDecimal avg, int count) {
        Rating r = new Rating();
        r.setUserId(userId);
        r.setAvgScore(avg);
        r.setFeedbackCount(count);
        return r;
    }

    private static User userOf(Long id, String username) {
        User u = new User();
        u.setId(id);
        u.setUsername(username);
        return u;
    }

    private static UserReview buildReview(Long id, Long revieweeId, Long reviewerId,
                                          BigDecimal score, String comment) {
        UserReview r = UserReview.builder()
                .revieweeId(revieweeId)
                .reviewerId(reviewerId)
                .score(score)
                .comment(comment)
                .build();
        r.setId(id);
        return r;
    }
}
