package pl.isigmas.kaucjapp.users;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class UserRatingEndpointTest extends BaseIntegrationTest {

    @Test
    void ratingWorks() throws Exception{
        String jsonFirst = """
                {
                    "user_id": 1005,
                    "username": "first",
                    "firstName": "First",
                    "lastName": "User",
                    "phone": "333444555",
                    "email": "first@example.com"
                }
                """;
        String jsonSecond = """
                {
                    "user_id": 1006,
                    "username": "second",
                    "firstName": "Second",
                    "lastName": "User",
                    "phone": "333444556",
                    "email": "second@example.com"
                }
                """;

        postCreateUser(jsonFirst).andExpect(status().isCreated());
        Long firstUserId = userRepository.findAll().stream()
                .filter(u -> "first".equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();

        postCreateUser(jsonSecond).andExpect(status().isCreated());
        Long secondUserId = userRepository.findAll().stream()
                .filter(u -> "second".equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(post("/api/user/" + secondUserId + "/rating")
                        .header("X-User-Id", firstUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":5}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/user/{id}/rating",secondUserId)
                .header("X-User-Id",secondUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(secondUserId))
                .andExpect(jsonPath("$.feedback_count").value(1))
                .andExpect(jsonPath("$.avg_score").value(5.00));
    }

    @Test
    void cannotRateYourselfReturns403() throws Exception {
        String json = """
                {
                    "user_id": 1005,
                    "username": "solo",
                    "firstName": "Solo",
                    "lastName": "User",
                    "phone": "333444555",
                    "email": "solo@example.com"
                }
                """;

        postCreateUser(json).andExpect(status().isCreated());

        Long userId = userRepository.findAll().stream()
                .filter(u -> "solo".equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(post("/api/user/" + userId + "/rating")
                        .header("X-User-Id", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":5}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void ratingWithInvalidScoreReturns400() throws Exception {
        String ratedJson = """
                {
                    "user_id": 1005,
                    "username": "rated",
                    "firstName": "R",
                    "lastName": "ated",
                    "phone": "444555666",
                    "email": "rated@example.com"
                }
                """;

        postCreateUser(ratedJson).andExpect(status().isCreated());

        String raterJson = """
                {
                    "user_id": 1006,
                    "username": "rater",
                    "firstName": "Ra",
                    "lastName": "ter",
                    "phone": "555666777",
                    "email": "rater@example.com"
                }
                """;

        postCreateUser(raterJson).andExpect(status().isCreated());

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
                        .content("{\"score\":0}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/user/" + ratedId + "/rating")
                        .header("X-User-Id", raterId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":6}"))
                .andExpect(status().isBadRequest());
    }

}
