package pl.isigmas.kaucjapp.deposit.integration.rating;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineRequestDTO;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineReview;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineStatus;
import pl.isigmas.kaucjapp.deposit.model.Rating;
import pl.isigmas.kaucjapp.deposit.repository.DepositMachineReviewRepository;
import pl.isigmas.kaucjapp.deposit.repository.RatingRepository;
import pl.isigmas.kaucjapp.deposit.support.BaseIntegrationTest;

import java.math.BigDecimal;
import java.util.Comparator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for deposit machine reviews and ratings (POST / PATCH / GET / DELETE).
 */
public class DepositMachineReviewEndpointTest extends BaseIntegrationTest {

    @Autowired
    private DepositMachineReviewRepository depositMachineReviewRepository;

    @Autowired
    private RatingRepository ratingRepository;

    // ---------- Etap 2: POST /api/deposit/machine/{id}/rating ----------

    @Test
    void postReview_validRequest_returns201_persistsReviewAndUpdatesAggregate() throws Exception {
        Long machineId = createMachine();
        Long reviewerId = 2001L;

        mockMvc.perform(post("/api/deposit/machine/{id}/rating", machineId)
                        .header("X-User-Id", reviewerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 4, "comment": "Fast and clean"}
                                """))
                .andExpect(status().isCreated());

        Rating rating = ratingRepository.findById(machineId).orElseThrow();
        assertThat(rating.getFeedbackCount()).isEqualTo(1);
        assertThat(rating.getAvgScore()).isEqualByComparingTo("4.00");

        assertThat(depositMachineReviewRepository.findAll()).singleElement().satisfies(r -> {
            assertThat(r.getDepositMachineId()).isEqualTo(machineId);
            assertThat(r.getReviewerId()).isEqualTo(reviewerId);
            assertThat(r.getScore()).isEqualByComparingTo("4");
            assertThat(r.getComment()).isEqualTo("Fast and clean");
        });
    }

    @Test
    void postReview_missingScore_returns400_validationError() throws Exception {
        Long machineId = createMachine();

        mockMvc.perform(post("/api/deposit/machine/{id}/rating", machineId)
                        .header("X-User-Id", 2001L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"comment": "no score"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("VALIDATION_ERR"))
                .andExpect(jsonPath("$.validation_errors.score").exists());

        assertThat(depositMachineReviewRepository.count()).isZero();
    }

    @Test
    void postReview_scoreOutOfRange_returns400() throws Exception {
        Long machineId = createMachine();

        mockMvc.perform(post("/api/deposit/machine/{id}/rating", machineId)
                        .header("X-User-Id", 2001L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 9}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("VALIDATION_ERR"));

        assertThat(depositMachineReviewRepository.count()).isZero();
    }

    @Test
    void postReview_unknownMachine_returns404() throws Exception {
        mockMvc.perform(post("/api/deposit/machine/{id}/rating", 999_999L)
                        .header("X-User-Id", 2001L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 4}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("DEP_001"));
    }

    @Test
    void postReview_missingUserIdHeader_returns400() throws Exception {
        Long machineId = createMachine();

        mockMvc.perform(post("/api/deposit/machine/{id}/rating", machineId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 4}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("BAD_REQUEST"));
    }

    // ---------- Etap 3: GET /api/deposit/machine/{id}/reviews ----------

    @Test
    void getReviews_returnsListWithReviewerIds() throws Exception {
        Long machineId = createMachine();
        postReview(machineId, 2001L, 5, "great");
        postReview(machineId, 2002L, 3, "ok");

        mockMvc.perform(get("/api/deposit/machine/{id}/reviews", machineId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].reviewer_id",
                        org.hamcrest.Matchers.containsInAnyOrder(2001, 2002)));

        assertThat(depositMachineReviewRepository.findAll())
                .extracting(r -> r.getScore().intValueExact())
                .containsExactlyInAnyOrder(5, 3);
    }

    @Test
    void getReviews_noReviews_returnsEmptyList() throws Exception {
        Long machineId = createMachine();

        mockMvc.perform(get("/api/deposit/machine/{id}/reviews", machineId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getReviews_unknownMachine_returns404() throws Exception {
        mockMvc.perform(get("/api/deposit/machine/{id}/reviews", 999_999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("DEP_001"));
    }

    // ---------- Etap 4: PATCH /api/deposit/reviews/{id} ----------

    @Test
    void patchReview_authorChangesScore_returns204_recomputesAggregate() throws Exception {
        Long machineId = createMachine();
        postReview(machineId, 2001L, 4, "old");
        Long reviewId = latestReviewId();

        mockMvc.perform(patch("/api/deposit/reviews/{id}", reviewId)
                        .header("X-User-Id", 2001L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 5, "comment": "improved"}
                                """))
                .andExpect(status().isNoContent());

        Rating rating = ratingRepository.findById(machineId).orElseThrow();
        assertThat(rating.getAvgScore()).isEqualByComparingTo("5.00");
        assertThat(rating.getFeedbackCount()).isEqualTo(1);

        DepositMachineReview review = depositMachineReviewRepository.findById(reviewId).orElseThrow();
        assertThat(review.getScore()).isEqualByComparingTo("5");
        assertThat(review.getComment()).isEqualTo("improved");
    }

    @Test
    void patchReview_byOtherUser_returns403() throws Exception {
        Long machineId = createMachine();
        postReview(machineId, 2001L, 4, "by alice");
        Long reviewId = latestReviewId();

        mockMvc.perform(patch("/api/deposit/reviews/{id}", reviewId)
                        .header("X-User-Id", 2002L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 1}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("DEP_007"));

        DepositMachineReview review = depositMachineReviewRepository.findById(reviewId).orElseThrow();
        assertThat(review.getScore()).isEqualByComparingTo("4");
    }

    @Test
    void patchReview_missing_returns404() throws Exception {
        mockMvc.perform(patch("/api/deposit/reviews/{id}", 999_999L)
                        .header("X-User-Id", 2001L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 5}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("DEP_006"));
    }

    @Test
    void patchReview_scoreOutOfRange_returns400() throws Exception {
        Long machineId = createMachine();
        postReview(machineId, 2001L, 4, "x");
        Long reviewId = latestReviewId();

        mockMvc.perform(patch("/api/deposit/reviews/{id}", reviewId)
                        .header("X-User-Id", 2001L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 9}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("VALIDATION_ERR"));
    }

    // ---------- Etap 5: DELETE /api/deposit/reviews/{id} ----------

    @Test
    void deleteReview_authorDeletes_returns204_recomputesAggregate() throws Exception {
        Long machineId = createMachine();
        postReview(machineId, 2001L, 5, "alice");
        Long aliceReviewId = latestReviewId();
        postReview(machineId, 2002L, 3, "bob");

        Rating before = ratingRepository.findById(machineId).orElseThrow();
        assertThat(before.getFeedbackCount()).isEqualTo(2);
        assertThat(before.getAvgScore()).isEqualByComparingTo("4.00");

        mockMvc.perform(delete("/api/deposit/reviews/{id}", aliceReviewId)
                        .header("X-User-Id", 2001L))
                .andExpect(status().isNoContent());

        Rating after = ratingRepository.findById(machineId).orElseThrow();
        assertThat(after.getFeedbackCount()).isEqualTo(1);
        assertThat(after.getAvgScore()).isEqualByComparingTo("3.00");

        assertThat(depositMachineReviewRepository.findById(aliceReviewId)).isEmpty();
    }

    @Test
    void deleteReview_byOtherUser_returns403_andKeepsReview() throws Exception {
        Long machineId = createMachine();
        postReview(machineId, 2001L, 5, "by alice");
        Long reviewId = latestReviewId();

        mockMvc.perform(delete("/api/deposit/reviews/{id}", reviewId)
                        .header("X-User-Id", 2002L))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("DEP_007"));

        assertThat(depositMachineReviewRepository.findById(reviewId)).isPresent();
    }

    @Test
    void deleteReview_missing_returns404() throws Exception {
        mockMvc.perform(delete("/api/deposit/reviews/{id}", 999_999L)
                        .header("X-User-Id", 2001L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("DEP_006"));
    }

    // ---------- GET /api/deposit/machine/{id}/rating ----------

    @Test
    void getRating_newMachine_returnsZeroAggregate() throws Exception {
        Long machineId = createMachine();

        mockMvc.perform(get("/api/deposit/machine/{id}/rating", machineId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deposit_machine_id").value(machineId))
                .andExpect(jsonPath("$.feedback_count").value(0))
                .andExpect(jsonPath("$.avg_score").value(0));
    }

    @Test
    void getRating_afterReview_returnsUpdatedAggregate() throws Exception {
        Long machineId = createMachine();
        postReview(machineId, 2001L, 5, "Great");
        postReview(machineId, 2002L, 3, "OK");

        mockMvc.perform(get("/api/deposit/machine/{id}/rating", machineId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deposit_machine_id").value(machineId))
                .andExpect(jsonPath("$.feedback_count").value(2))
                .andExpect(jsonPath("$.avg_score").value(4.00));
    }

    @Test
    void getRating_unknownMachine_returns404() throws Exception {
        mockMvc.perform(get("/api/deposit/machine/999999/rating"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("DEP_008"));
    }

    // ---------- helpers ----------

    private Long createMachine() throws Exception {
        DepositMachineRequestDTO create = DepositMachineRequestDTO.builder()
                .networkName("Zabka")
                .status(DepositMachineStatus.AVAILABLE)
                .address("ul. Testowa 1, Kraków")
                .latitude(new BigDecimal("50.052000"))
                .longitude(new BigDecimal("19.936000"))
                .openingHours(openingHoursFullWeek())
                .build();

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isCreated());

        return depositMachineRepository.findAll().getFirst().getId();
    }

    private void postReview(Long machineId, Long reviewerId, int score, String comment) throws Exception {
        mockMvc.perform(post("/api/deposit/machine/{id}/rating", machineId)
                        .header("X-User-Id", reviewerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": %d, "comment": "%s"}
                                """.formatted(score, comment)))
                .andExpect(status().isCreated());
    }

    private Long latestReviewId() {
        return depositMachineReviewRepository.findAll().stream()
                .max(Comparator.comparing(DepositMachineReview::getId))
                .orElseThrow()
                .getId();
    }
}
