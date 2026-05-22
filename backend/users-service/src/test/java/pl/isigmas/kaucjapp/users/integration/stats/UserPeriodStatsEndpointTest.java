package pl.isigmas.kaucjapp.users.integration.stats;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import pl.isigmas.kaucjapp.users.repository.UserDailyStatsRepository;
import pl.isigmas.kaucjapp.users.support.BaseIntegrationTest;

import java.time.LocalDate;
import java.time.ZoneOffset;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserPeriodStatsEndpointTest extends BaseIntegrationTest {

    @Autowired
    private UserDailyStatsRepository userDailyStatsRepository;

    @Test
    void getMyPeriodStats_returnsSummedBuckets() throws Exception {
        Long userId = createUser(6001L, "periodapi01", "periodapi01@example.com");
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate yesterday = today.minusDays(1);

        userDailyStatsRepository.upsertDailyStats(userId, yesterday, 2, 0, 0, 0);
        userDailyStatsRepository.upsertDailyStats(userId, today, 1, 1, 4, 0);

        mockMvc.perform(get("/api/user/me/stats/period")
                        .header("X-User-Id", userId)
                        .param("days", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(userId))
                .andExpect(jsonPath("$.period_days").value(30))
                .andExpect(jsonPath("$.returned_bottle_count").value(3))
                .andExpect(jsonPath("$.returned_can_count").value(1))
                .andExpect(jsonPath("$.returned_total_count").value(4))
                .andExpect(jsonPath("$.collected_bottle_count").value(4))
                .andExpect(jsonPath("$.collected_total_count").value(4));
    }

    @Test
    void getUserPeriodStats_returnsStatsForGivenUser() throws Exception {
        Long userId = createUser(6011L, "periodapi11", "periodapi11@example.com");
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        userDailyStatsRepository.upsertDailyStats(userId, today, 0, 5, 0, 0);

        mockMvc.perform(get("/api/user/{id}/stats/period", userId)
                        .param("days", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(userId))
                .andExpect(jsonPath("$.period_days").value(7))
                .andExpect(jsonPath("$.returned_can_count").value(5))
                .andExpect(jsonPath("$.returned_total_count").value(5));
    }

    @Test
    void getMyPeriodStats_invalidDays_returnsBadRequest() throws Exception {
        Long userId = createUser(6021L, "periodapi21", "periodapi21@example.com");

        mockMvc.perform(get("/api/user/me/stats/period")
                        .header("X-User-Id", userId)
                        .param("days", "0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getUserPeriodStats_unknownUser_returnsNotFound() throws Exception {
        mockMvc.perform(get("/api/user/{id}/stats/period", 999999L))
                .andExpect(status().isNotFound());
    }

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

    private static String capitalize(String s) {
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
