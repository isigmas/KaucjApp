package pl.isigmas.kaucjapp.deposit.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;
    @Mock
    private DepositMachineReviewRepository depositMachineReviewRepository;

    @InjectMocks
    private RatingService ratingService;

    // ---------- createReview ----------

    @Test
    void createReview_firstReview_setsAvgToScoreAndCountToOne() {
        Long machineId = 10L;
        Long reviewerId = 20L;
        Rating rating = ratingOf(machineId, BigDecimal.ZERO, 0);
        ReviewRequestDTO req = reviewReq(new BigDecimal("4"), "works well");

        when(ratingRepository.findById(machineId)).thenReturn(Optional.of(rating));

        ratingService.createReview(machineId, reviewerId, req);

        ArgumentCaptor<DepositMachineReview> savedReview = ArgumentCaptor.forClass(DepositMachineReview.class);
        verify(depositMachineReviewRepository).save(savedReview.capture());
        DepositMachineReview review = savedReview.getValue();
        assertThat(review.getDepositMachineId()).isEqualTo(machineId);
        assertThat(review.getReviewerId()).isEqualTo(reviewerId);
        assertThat(review.getScore()).isEqualByComparingTo("4");
        assertThat(review.getComment()).isEqualTo("works well");

        assertThat(rating.getFeedbackCount()).isEqualTo(1);
        assertThat(rating.getAvgScore()).isEqualByComparingTo("4.00");
    }

    @Test
    void createReview_subsequentReview_updatesRunningAverage() {
        Long machineId = 1L;
        Long reviewerId = 2L;
        Rating rating = ratingOf(machineId, new BigDecimal("4.00"), 2);
        when(ratingRepository.findById(machineId)).thenReturn(Optional.of(rating));

        ratingService.createReview(machineId, reviewerId, reviewReq(new BigDecimal("5"), null));

        assertThat(rating.getFeedbackCount()).isEqualTo(3);
        assertThat(rating.getAvgScore()).isEqualByComparingTo("4.33");
        verify(depositMachineReviewRepository).save(any(DepositMachineReview.class));
    }

    @Test
    void createReview_machineMissing_throwsDepositMachineNotFound_andDoesNotPersistReview() {
        when(ratingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                ratingService.createReview(999L, 1L, reviewReq(new BigDecimal("3"), null)))
                .isInstanceOf(DepositMachineNotFoundException.class);

        verify(depositMachineReviewRepository, never()).save(any());
    }

    // ---------- getDepositMachineReviews ----------

    @Test
    void getDepositMachineReviews_returnsMappedList() {
        Long machineId = 100L;
        DepositMachineReview r1 = buildReview(1L, machineId, 11L, new BigDecimal("5"), "great");
        DepositMachineReview r2 = buildReview(2L, machineId, 12L, new BigDecimal("3"), "ok");

        when(ratingRepository.existsById(machineId)).thenReturn(true);
        when(depositMachineReviewRepository.findByDepositMachineIdOrderByCreatedAtDesc(machineId))
                .thenReturn(List.of(r1, r2));

        List<ReviewResponseDTO> result = ratingService.getDepositMachineReviews(machineId);

        assertThat(result).hasSize(2);
        assertThat(result)
                .extracting(ReviewResponseDTO::getReviewId, ReviewResponseDTO::getReviewerId)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple(1L, 11L),
                        org.assertj.core.groups.Tuple.tuple(2L, 12L));
    }

    @Test
    void getDepositMachineReviews_unknownMachine_throwsDepositMachineNotFound() {
        when(ratingRepository.existsById(404L)).thenReturn(false);

        assertThatThrownBy(() -> ratingService.getDepositMachineReviews(404L))
                .isInstanceOf(DepositMachineNotFoundException.class);

        verifyNoInteractions(depositMachineReviewRepository);
    }

    @Test
    void getDepositMachineReviews_reviewWithNullReviewerId_mapsReviewerIdAsNull() {
        Long machineId = 100L;
        DepositMachineReview anonymized = buildReview(7L, machineId, null, new BigDecimal("2"), "ghost");

        when(ratingRepository.existsById(machineId)).thenReturn(true);
        when(depositMachineReviewRepository.findByDepositMachineIdOrderByCreatedAtDesc(machineId))
                .thenReturn(List.of(anonymized));

        List<ReviewResponseDTO> result = ratingService.getDepositMachineReviews(machineId);

        assertThat(result).singleElement()
                .satisfies(dto -> assertThat(dto.getReviewerId()).isNull());
    }

    // ---------- updateReview ----------

    @Test
    void updateReview_authorChangesScoreAndComment_recomputesAverageInPlace() {
        Long reviewId = 1L;
        Long reviewerId = 20L;
        Long machineId = 10L;
        DepositMachineReview review = buildReview(reviewId, machineId, reviewerId, new BigDecimal("4"), "old");
        Rating rating = ratingOf(machineId, new BigDecimal("4.00"), 2);

        UpdateReviewDTO req = new UpdateReviewDTO();
        req.setScore(new BigDecimal("5"));
        req.setComment("better");

        when(depositMachineReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        when(ratingRepository.findById(machineId)).thenReturn(Optional.of(rating));

        ratingService.updateReview(reviewId, reviewerId, req);

        assertThat(review.getScore()).isEqualByComparingTo("5");
        assertThat(review.getComment()).isEqualTo("better");
        assertThat(rating.getAvgScore()).isEqualByComparingTo("4.50");
        assertThat(rating.getFeedbackCount()).isEqualTo(2);
        verify(depositMachineReviewRepository).save(review);
    }

    @Test
    void updateReview_emptyPayload_isNoOpAndDoesNotTouchRating() {
        Long reviewId = 1L;
        Long reviewerId = 20L;
        DepositMachineReview review = buildReview(reviewId, 10L, reviewerId, new BigDecimal("3"), "orig");

        when(depositMachineReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        ratingService.updateReview(reviewId, reviewerId, new UpdateReviewDTO());

        assertThat(review.getScore()).isEqualByComparingTo("3");
        assertThat(review.getComment()).isEqualTo("orig");
        verify(ratingRepository, never()).findById(any());
        verify(depositMachineReviewRepository).save(review);
    }

    @Test
    void updateReview_byOtherUser_throwsReviewForbidden() {
        Long reviewId = 1L;
        DepositMachineReview review = buildReview(reviewId, 10L, 20L, new BigDecimal("3"), "x");
        when(depositMachineReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        assertThatThrownBy(() ->
                ratingService.updateReview(reviewId, 99L, new UpdateReviewDTO()))
                .isInstanceOf(ReviewForbiddenException.class);

        verify(depositMachineReviewRepository, never()).save(any());
    }

    @Test
    void updateReview_nullReviewerId_throwsReviewForbidden() {
        Long reviewId = 1L;
        DepositMachineReview review = buildReview(reviewId, 10L, null, new BigDecimal("3"), "anon");
        when(depositMachineReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        assertThatThrownBy(() ->
                ratingService.updateReview(reviewId, 20L, new UpdateReviewDTO()))
                .isInstanceOf(ReviewForbiddenException.class);
    }

    @Test
    void updateReview_missingReview_throwsReviewNotFound() {
        when(depositMachineReviewRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                ratingService.updateReview(42L, 1L, new UpdateReviewDTO()))
                .isInstanceOf(ReviewNotFoundException.class);
    }

    // ---------- deleteReview ----------

    @Test
    void deleteReview_authorDeletes_recomputesAverageAndDecrementsCount() {
        Long reviewId = 1L;
        Long reviewerId = 20L;
        Long machineId = 10L;
        DepositMachineReview review = buildReview(reviewId, machineId, reviewerId, new BigDecimal("3"), "x");
        Rating rating = ratingOf(machineId, new BigDecimal("4.00"), 2);

        when(depositMachineReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        when(ratingRepository.findById(machineId)).thenReturn(Optional.of(rating));

        ratingService.deleteReview(reviewId, reviewerId);

        assertThat(rating.getFeedbackCount()).isEqualTo(1);
        assertThat(rating.getAvgScore()).isEqualByComparingTo("5.00");
        verify(depositMachineReviewRepository).delete(review);
    }

    @Test
    void deleteReview_lastReview_setsAverageToZero_andCountToZero() {
        Long reviewId = 1L;
        Long reviewerId = 20L;
        Long machineId = 10L;
        DepositMachineReview review = buildReview(reviewId, machineId, reviewerId, new BigDecimal("5"), "x");
        Rating rating = ratingOf(machineId, new BigDecimal("5.00"), 1);

        when(depositMachineReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
        when(ratingRepository.findById(machineId)).thenReturn(Optional.of(rating));

        ratingService.deleteReview(reviewId, reviewerId);

        assertThat(rating.getFeedbackCount()).isZero();
        assertThat(rating.getAvgScore()).isEqualByComparingTo("0");
    }

    @Test
    void deleteReview_byOtherUser_throwsReviewForbidden_andDoesNotDelete() {
        Long reviewId = 1L;
        DepositMachineReview review = buildReview(reviewId, 10L, 20L, new BigDecimal("3"), "x");
        when(depositMachineReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> ratingService.deleteReview(reviewId, 99L))
                .isInstanceOf(ReviewForbiddenException.class);

        verify(depositMachineReviewRepository, never()).delete(any());
    }

    @Test
    void deleteReview_nullReviewerId_throwsReviewForbidden() {
        Long reviewId = 1L;
        DepositMachineReview review = buildReview(reviewId, 10L, null, new BigDecimal("3"), "anon");
        when(depositMachineReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> ratingService.deleteReview(reviewId, 20L))
                .isInstanceOf(ReviewForbiddenException.class);
    }

    @Test
    void deleteReview_missingReview_throwsReviewNotFound() {
        when(depositMachineReviewRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ratingService.deleteReview(42L, 1L))
                .isInstanceOf(ReviewNotFoundException.class);
    }

    // ---------- helpers ----------

    private static ReviewRequestDTO reviewReq(BigDecimal score, String comment) {
        ReviewRequestDTO dto = new ReviewRequestDTO();
        dto.setScore(score);
        dto.setComment(comment);
        return dto;
    }

    private static Rating ratingOf(Long machineId, BigDecimal avg, int count) {
        Rating r = new Rating();
        r.setDepositMachineId(machineId);
        r.setAvgScore(avg);
        r.setFeedbackCount(count);
        return r;
    }

    private static DepositMachineReview buildReview(Long id, Long machineId, Long reviewerId,
                                                    BigDecimal score, String comment) {
        DepositMachineReview r = DepositMachineReview.builder()
                .depositMachineId(machineId)
                .reviewerId(reviewerId)
                .score(score)
                .comment(comment)
                .build();
        r.setId(id);
        return r;
    }
}
