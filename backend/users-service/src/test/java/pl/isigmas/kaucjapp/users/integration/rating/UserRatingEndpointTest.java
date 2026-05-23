package pl.isigmas.kaucjapp.users.integration.rating;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.users.support.BaseIntegrationTest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class UserRatingEndpointTest extends BaseIntegrationTest {

    @Test
    void ratingWorks() throws Exception {
        String jsonFirst = """
                {
                    "user_id": 1005,
                    "username": "first",
                    "first_name": "First",
                    "last_name": "User",
                    "phone": "333444555",
                    "email": "first@example.com"
                }
                """;
        String jsonSecond = """
                {
                    "user_id": 1006,
                    "username": "second",
                    "first_name": "Second",
                    "last_name": "User",
                    "phone": "333444556",
                    "email": "second@example.com"
                }
                """;

        postCreateUser(jsonFirst);
        Long firstUserId = userRepository.findAll().stream()
                .filter(u -> "first".equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();

        postCreateUser(jsonSecond);
        Long secondUserId = userRepository.findAll().stream()
                .filter(u -> "second".equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(post("/api/user/" + secondUserId + "/rating")
                        .header("X-User-Id", firstUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":5,\"offer_id\":1001}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/user/{id}/rating", secondUserId)
                        .header("X-User-Id", secondUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(secondUserId))
                .andExpect(jsonPath("$.feedback_count").value(1))
                .andExpect(jsonPath("$.avg_score").value(5.00));
    }

    @Test
    void getRatingForNonExistentUserReturns404() throws Exception {
        mockMvc.perform(get("/api/user/999999/rating"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("USER_002"));
    }

    @Test
    void cannotRateYourselfReturns403() throws Exception {
        String json = """
                {
                    "user_id": 1005,
                    "username": "solo",
                    "first_name": "Solo",
                    "last_name": "User",
                    "phone": "333444555",
                    "email": "solo@example.com"
                }
                """;

        postCreateUser(json);

        Long userId = userRepository.findAll().stream()
                .filter(u -> "solo".equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(post("/api/user/" + userId + "/rating")
                        .header("X-User-Id", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":5,\"offer_id\":1001}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void ratingWithInvalidScoreReturns400() throws Exception {
        String ratedJson = """
                {
                    "user_id": 1005,
                    "username": "rated",
                    "first_name": "R",
                    "last_name": "ated",
                    "phone": "444555666",
                    "email": "rated@example.com"
                }
                """;

        postCreateUser(ratedJson);

        String raterJson = """
                {
                    "user_id": 1006,
                    "username": "rater",
                    "first_name": "Ra",
                    "last_name": "ter",
                    "phone": "555666777",
                    "email": "rater@example.com"
                }
                """;

        postCreateUser(raterJson);

        Long ratedId = userRepository.findAll().stream()
                .filter(u -> "rated".equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();
        Long raterId = userRepository.findAll().stream()
                .filter(u -> "rater".equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(post("/api/user/" + ratedId + "/rating")
                        .header("X-User-Id", raterId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":0,\"offer_id\":1002}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/user/" + ratedId + "/rating")
                        .header("X-User-Id", raterId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":6,\"offer_id\":1002}"))
                .andExpect(status().isBadRequest());
    }

}
