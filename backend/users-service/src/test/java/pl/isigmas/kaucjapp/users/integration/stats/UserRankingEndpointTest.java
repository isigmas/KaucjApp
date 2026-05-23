package pl.isigmas.kaucjapp.users.integration.stats;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import pl.isigmas.kaucjapp.users.model.UserStats;
import pl.isigmas.kaucjapp.users.repository.UserStatsRepository;
import pl.isigmas.kaucjapp.users.support.BaseIntegrationTest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserRankingEndpointTest extends BaseIntegrationTest {

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Test
    void ranking_returnedPlastic_sortsDesc() throws Exception {
        Long u1 = createUser(3001L, "u1", "u1@example.com");
        Long u2 = createUser(3002L, "u2", "u2@example.com");
        Long u3 = createUser(3003L, "u3", "u3@example.com");

        setStats(u1, 10, 0, 0, 0);
        setStats(u2, 5, 0, 0, 0);
        setStats(u3, 20, 0, 0, 0);

        mockMvc.perform(get("/api/user/ranking")
                        .param("type", "returned_plastic")
                        .param("page", "0")
                        .param("size", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].user_id").value(u3))
                .andExpect(jsonPath("$[1].user_id").value(u1))
                .andExpect(jsonPath("$[2].user_id").value(u2));
    }

    @Test
    void ranking_returnedTotal_usesFormulaAndSortsDesc() throws Exception {
        Long u1 = createUser(3101L, "t1", "t1@example.com");
        Long u2 = createUser(3102L, "t2", "t2@example.com");
        Long u3 = createUser(3103L, "t3", "t3@example.com");

        // totals: u1=9, u2=6, u3=10
        setStats(u1, 7, 2, 0, 0);
        setStats(u2, 6, 0, 0, 0);
        setStats(u3, 1, 9, 0, 0);

        mockMvc.perform(get("/api/user/ranking")
                        .param("type", "returned_total")
                        .param("page", "0")
                        .param("size", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].user_id").value(u3))
                .andExpect(jsonPath("$[0].returned_total_count").value(10))
                .andExpect(jsonPath("$[1].user_id").value(u1))
                .andExpect(jsonPath("$[1].returned_total_count").value(9))
                .andExpect(jsonPath("$[2].user_id").value(u2))
                .andExpect(jsonPath("$[2].returned_total_count").value(6));
    }

    @Test
    void ranking_collectedTotal_usesFormulaAndSortsDesc() throws Exception {
        Long u1 = createUser(3201L, "c1", "c1@example.com");
        Long u2 = createUser(3202L, "c2", "c2@example.com");
        Long u3 = createUser(3203L, "c3", "c3@example.com");

        // totals: u1=1, u2=4, u3=3
        setStats(u1, 0, 0, 1, 0);
        setStats(u2, 0, 0, 2, 2);
        setStats(u3, 0, 0, 0, 3);

        mockMvc.perform(get("/api/user/ranking")
                        .param("type", "collected_total")
                        .param("page", "0")
                        .param("size", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].user_id").value(u2))
                .andExpect(jsonPath("$[0].collected_total_count").value(4))
                .andExpect(jsonPath("$[1].user_id").value(u3))
                .andExpect(jsonPath("$[1].collected_total_count").value(3))
                .andExpect(jsonPath("$[2].user_id").value(u1))
                .andExpect(jsonPath("$[2].collected_total_count").value(1));
    }

    @Test
    void ranking_period_invalidType_returnsBadRequest() throws Exception {
        createUser(3401L, "bad1", "bad1@example.com");

        mockMvc.perform(get("/api/user/ranking")
                        .param("type", "invalid_type")
                        .param("days", "30"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void ranking_period_invalidDays_returnsBadRequest() throws Exception {
        createUser(3411L, "bad2", "bad2@example.com");

        mockMvc.perform(get("/api/user/ranking")
                        .param("type", "returned_total")
                        .param("days", "400"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void ranking_allTime_invalidType_returnsBadRequest() throws Exception {
        createUser(3421L, "bad3", "bad3@example.com");

        mockMvc.perform(get("/api/user/ranking")
                        .param("type", "not_a_metric")
                        .param("days", "0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void ranking_pagination_works() throws Exception {
        Long u1 = createUser(3301L, "p1", "p1@example.com");
        Long u2 = createUser(3302L, "p2", "p2@example.com");
        Long u3 = createUser(3303L, "p3", "p3@example.com");

        setStats(u1, 1, 0, 0, 0);
        setStats(u2, 2, 0, 0, 0);
        setStats(u3, 3, 0, 0, 0);

        // page 1 size 1 -> second user in sorted order: u2
        mockMvc.perform(get("/api/user/ranking")
                        .param("type", "returned_plastic")
                        .param("page", "1")
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].user_id").value(u2));
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

    private void setStats(Long userId, int returnedPlastic, int returnedCan, int collectedPlastic, int collectedCan) {
        UserStats stats = userStatsRepository.findById(userId).orElseThrow();
        stats.setReturnedPlasticCount(returnedPlastic);
        stats.setReturnedCanCount(returnedCan);
        stats.setCollectedPlasticCount(collectedPlastic);
        stats.setCollectedCanCount(collectedCan);
        userStatsRepository.saveAndFlush(stats);
    }

    private static String capitalize(String s) {
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}

