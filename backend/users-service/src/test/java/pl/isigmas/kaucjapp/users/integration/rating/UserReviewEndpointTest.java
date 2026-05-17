package pl.isigmas.kaucjapp.users.integration.rating;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.users.model.UserReview;
import pl.isigmas.kaucjapp.users.repository.RatingRepository;
import pl.isigmas.kaucjapp.users.repository.UserReviewRepository;
import pl.isigmas.kaucjapp.users.support.BaseIntegrationTest;

import java.util.Comparator;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class UserReviewEndpointTest extends BaseIntegrationTest {

    @Autowired
    private UserReviewRepository userReviewRepository;

    @Autowired
    private RatingRepository ratingRepository;

    // ---------- POST /api/user/{id}/rating ----------

    @Test
    void postRating_validRequest_returns200_storesReviewAndUpdatesAggregate() throws Exception {
        // Given
        Long reviewerId = createUser(2001L, "alice", "alice@example.com");
        Long revieweeId = createUser(2002L, "bob", "bob@example.com");

        // When
        mockMvc.perform(post("/api/user/{id}/rating", revieweeId)
                        .header("X-User-Id", reviewerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 4, "comment": "Solid kaucjapper"}
                                """))
                .andExpect(status().isCreated());

        // Then: aggregate updated
        mockMvc.perform(get("/api/user/{id}/rating", revieweeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(revieweeId))
                .andExpect(jsonPath("$.feedback_count").value(1))
                .andExpect(jsonPath("$.avg_score").value(4.00));

        // Then: detailed review persisted with comment
        List<UserReview> reviews = userReviewRepository.findAll();
        assertThat(reviews).singleElement().satisfies(r -> {
            assertThat(r.getRevieweeId()).isEqualTo(revieweeId);
            assertThat(r.getReviewerId()).isEqualTo(reviewerId);
            assertThat(r.getScore()).isEqualByComparingTo("4");
            assertThat(r.getComment()).isEqualTo("Solid kaucjapper");
        });
    }

    @Test
    void postRating_missingScore_returns400_validationError() throws Exception {
        Long reviewerId = createUser(2001L, "alice", "alice@example.com");
        Long revieweeId = createUser(2002L, "bob", "bob@example.com");

        mockMvc.perform(post("/api/user/{id}/rating", revieweeId)
                        .header("X-User-Id", reviewerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"comment": "no score"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("VALIDATION_ERR"))
                .andExpect(jsonPath("$.validation_errors.score").exists());

        assertThat(userReviewRepository.count()).isZero();
    }

    @Test
    void postRating_scoreOutOfRange_returns400() throws Exception {
        Long reviewerId = createUser(2001L, "alice", "alice@example.com");
        Long revieweeId = createUser(2002L, "bob", "bob@example.com");

        mockMvc.perform(post("/api/user/{id}/rating", revieweeId)
                        .header("X-User-Id", reviewerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 7}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("VALIDATION_ERR"));

        assertThat(userReviewRepository.count()).isZero();
    }

    @Test
    void postRating_selfReview_returns403_andDoesNotPersist() throws Exception {
        Long me = createUser(2001L, "alice", "alice@example.com");

        mockMvc.perform(post("/api/user/{id}/rating", me)
                        .header("X-User-Id", me)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 5}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("USER_004"));

        assertThat(userReviewRepository.count()).isZero();
    }

    @Test
    void postRating_unknownReviewee_returns404() throws Exception {
        Long reviewerId = createUser(2001L, "alice", "alice@example.com");

        mockMvc.perform(post("/api/user/{id}/rating", 999_999L)
                        .header("X-User-Id", reviewerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 4}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("USER_001"));
    }

    @Test
    void postRating_missingUserIdHeader_returns400() throws Exception {
        Long revieweeId = createUser(2002L, "bob", "bob@example.com");

        mockMvc.perform(post("/api/user/{id}/rating", revieweeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 4}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("BAD_REQUEST"));
    }

    // ---------- GET /api/user/{id}/reviews ----------

    @Test
    void getUserReviews_returnsListWithUsernames_newestFirst() throws Exception {
        Long alice = createUser(2001L, "alice", "alice@example.com");
        Long bob = createUser(2002L, "bob", "bob@example.com");
        Long carol = createUser(2003L, "carol", "carol@example.com");

        rateUser(bob, alice, 5, "great");
        rateUser(bob, carol, 3, "ok");

        mockMvc.perform(get("/api/user/{id}/reviews", bob))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].reviewer_username",
                        org.hamcrest.Matchers.containsInAnyOrder("alice", "carol")));

        assertThat(userReviewRepository.findAll())
                .extracting(r -> r.getScore().intValueExact())
                .containsExactlyInAnyOrder(5, 3);
    }

    @Test
    void getUserReviews_noReviews_returnsEmptyList() throws Exception {
        Long bob = createUser(2002L, "bob", "bob@example.com");

        mockMvc.perform(get("/api/user/{id}/reviews", bob))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getUserReviews_unknownUser_returns404() throws Exception {
        mockMvc.perform(get("/api/user/{id}/reviews", 999_999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("USER_001"));
    }

    // ---------- GET /api/user/reviews/{id} ----------

    @Test
    void getReview_existing_returns200_withDto() throws Exception {
        Long alice = createUser(2001L, "alice", "alice@example.com");
        Long bob = createUser(2002L, "bob", "bob@example.com");
        rateUser(bob, alice, 4, "ok");
        Long reviewId = latestReviewId();

        mockMvc.perform(get("/api/user/reviews/{id}", reviewId)
                        .header("X-User-Id", alice))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.review_id").value(reviewId))
                .andExpect(jsonPath("$.reviewer_id").value(alice))
                .andExpect(jsonPath("$.reviewer_username").value("alice"))
                .andExpect(jsonPath("$.score").value(4.0))
                .andExpect(jsonPath("$.comment").value("ok"));
    }

    @Test
    void getReview_missing_returns404() throws Exception {
        Long alice = createUser(2001L, "alice", "alice@example.com");

        mockMvc.perform(get("/api/user/reviews/{id}", 999_999L)
                        .header("X-User-Id", alice))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("USER_006"));
    }

    // ---------- PATCH /api/user/reviews/{id} ----------

    @Test
    void patchReview_authorChangesScore_returns200_recomputesAggregate() throws Exception {
        Long alice = createUser(2001L, "alice", "alice@example.com");
        Long bob = createUser(2002L, "bob", "bob@example.com");
        rateUser(bob, alice, 4, "old");
        Long reviewId = latestReviewId();

        mockMvc.perform(patch("/api/user/reviews/{id}", reviewId)
                        .header("X-User-Id", alice)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 5, "comment": "improved"}
                                """))
                .andExpect(status().isNoContent());

        // Aggregate refreshed: only one review, score now 5 → avg=5.00
        mockMvc.perform(get("/api/user/{id}/rating", bob))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avg_score").value(5.00))
                .andExpect(jsonPath("$.feedback_count").value(1));

        // Detailed review changed
        UserReview review = userReviewRepository.findById(reviewId).orElseThrow();
        assertThat(review.getScore()).isEqualByComparingTo("5");
        assertThat(review.getComment()).isEqualTo("improved");
    }

    @Test
    void patchReview_byOtherUser_returns403() throws Exception {
        Long alice = createUser(2001L, "alice", "alice@example.com");
        Long bob = createUser(2002L, "bob", "bob@example.com");
        Long carol = createUser(2003L, "carol", "carol@example.com");

        rateUser(bob, alice, 4, "by alice");
        Long reviewId = latestReviewId();

        mockMvc.perform(patch("/api/user/reviews/{id}", reviewId)
                        .header("X-User-Id", carol)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 1}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("USER_007"));

        UserReview review = userReviewRepository.findById(reviewId).orElseThrow();
        assertThat(review.getScore()).isEqualByComparingTo("4");
    }

    @Test
    void patchReview_missing_returns404() throws Exception {
        Long alice = createUser(2001L, "alice", "alice@example.com");

        mockMvc.perform(patch("/api/user/reviews/{id}", 999_999L)
                        .header("X-User-Id", alice)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 5}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("USER_006"));
    }

    @Test
    void patchReview_scoreOutOfRange_returns400() throws Exception {
        Long alice = createUser(2001L, "alice", "alice@example.com");
        Long bob = createUser(2002L, "bob", "bob@example.com");
        rateUser(bob, alice, 4, "x");
        Long reviewId = latestReviewId();

        mockMvc.perform(patch("/api/user/reviews/{id}", reviewId)
                        .header("X-User-Id", alice)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": 9}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("VALIDATION_ERR"));
    }

    // ---------- DELETE /api/user/reviews/{id} ----------

    @Test
    void deleteReview_authorDeletes_returns200_andUpdatesAggregate() throws Exception {
        Long alice = createUser(2001L, "alice", "alice@example.com");
        Long bob = createUser(2002L, "bob", "bob@example.com");
        Long carol = createUser(2003L, "carol", "carol@example.com");

        rateUser(bob, alice, 5, "alice-review");
        Long aliceReviewId = latestReviewId();
        rateUser(bob, carol, 3, "carol-review");

        // Aggregate before: avg=(5+3)/2=4.00
        mockMvc.perform(get("/api/user/{id}/rating", bob))
                .andExpect(jsonPath("$.feedback_count").value(2))
                .andExpect(jsonPath("$.avg_score").value(4.00));

        // When
        mockMvc.perform(delete("/api/user/reviews/{id}", aliceReviewId)
                        .header("X-User-Id", alice))
                .andExpect(status().isNoContent());

        // Then: aggregate now only Carol's 3 → avg=3.00, count=1
        mockMvc.perform(get("/api/user/{id}/rating", bob))
                .andExpect(jsonPath("$.feedback_count").value(1))
                .andExpect(jsonPath("$.avg_score").value(3.00));

        assertThat(userReviewRepository.findById(aliceReviewId)).isEmpty();
    }

    @Test
    void deleteReview_byOtherUser_returns403_andKeepsReview() throws Exception {
        Long alice = createUser(2001L, "alice", "alice@example.com");
        Long bob = createUser(2002L, "bob", "bob@example.com");
        Long carol = createUser(2003L, "carol", "carol@example.com");

        rateUser(bob, alice, 5, "by alice");
        Long reviewId = latestReviewId();

        mockMvc.perform(delete("/api/user/reviews/{id}", reviewId)
                        .header("X-User-Id", carol))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("USER_007"));

        assertThat(userReviewRepository.findById(reviewId)).isPresent();
    }

    @Test
    void deleteReview_missing_returns404() throws Exception {
        Long alice = createUser(2001L, "alice", "alice@example.com");

        mockMvc.perform(delete("/api/user/reviews/{id}", 999_999L)
                        .header("X-User-Id", alice))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("USER_006"));
    }

    // ---------- helpers ----------

    /**
     * Creates a user via the Kafka listener path (mirrors BaseIntegrationTest.postCreateUser)
     * and returns the persisted DB id (the listener-generated id can differ from the request id
     * if the sequence has advanced — we look it up by username to stay robust).
     */
    private Long createUser(long requestedId, String username, String email) throws Exception {
        String json = """
                {
                    "user_id": %d,
                    "username": "%s",
                    "first_name": "%s",
                    "last_name": "User",
                    "phone": "111222333",
                    "email": "%s"
                }
                """.formatted(requestedId, username, capitalize(username), email);
        postCreateUser(json);
        return userRepository.findAll().stream()
                .filter(u -> username.equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();
    }

    private void rateUser(Long revieweeId, Long reviewerId, int score, String comment) throws Exception {
        mockMvc.perform(post("/api/user/{id}/rating", revieweeId)
                        .header("X-User-Id", reviewerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score": %d, "comment": "%s"}
                                """.formatted(score, comment)))
                .andExpect(status().isCreated());
    }

    private Long latestReviewId() {
        return userReviewRepository.findAll().stream()
                .max(Comparator.comparing(UserReview::getId))
                .orElseThrow()
                .getId();
    }

    private static String capitalize(String s) {
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
