package pl.isigmas.kaucjapp.users.integration.stats;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import pl.isigmas.kaucjapp.users.DTO.UserPeriodStatsDTO;
import pl.isigmas.kaucjapp.users.service.UserPeriodStatsService;
import pl.isigmas.kaucjapp.users.support.BaseIntegrationTest;

import java.time.LocalDate;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class UserPeriodStatsServiceIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UserPeriodStatsService userPeriodStatsService;

    @Autowired
    private pl.isigmas.kaucjapp.users.repository.UserDailyStatsRepository userDailyStatsRepository;

    @Test
    void getStatsForPeriod_sumsMultipleDailyBuckets() throws Exception {
        Long userId = createUser(5001L, "period01", "period01@example.com");
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate twoDaysAgo = today.minusDays(2);
        LocalDate yesterday = today.minusDays(1);

        userDailyStatsRepository.upsertDailyStats(userId, twoDaysAgo, 1, 0, 0, 0);
        userDailyStatsRepository.upsertDailyStats(userId, yesterday, 2, 1, 0, 0);
        userDailyStatsRepository.upsertDailyStats(userId, today, 0, 0, 3, 1);

        UserPeriodStatsDTO stats = userPeriodStatsService.getStatsForPeriod(userId, twoDaysAgo, today);

        assertThat(stats.getReturnedBottleCount()).isEqualTo(3);
        assertThat(stats.getReturnedCanCount()).isEqualTo(1);
        assertThat(stats.getReturnedTotalCount()).isEqualTo(4);
        assertThat(stats.getCollectedBottleCount()).isEqualTo(3);
        assertThat(stats.getCollectedCanCount()).isEqualTo(1);
        assertThat(stats.getCollectedTotalCount()).isEqualTo(4);
        assertThat(stats.getPeriodDays()).isEqualTo(3);
        assertThat(stats.getFromDate()).isEqualTo(twoDaysAgo);
        assertThat(stats.getToDate()).isEqualTo(today);
    }

    @Test
    void getStatsForLastDays_excludesBucketsOutsideWindow() throws Exception {
        Long userId = createUser(5011L, "period11", "period11@example.com");
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate outsideWindow = today.minusDays(40);

        userDailyStatsRepository.upsertDailyStats(userId, today, 5, 0, 0, 0);
        userDailyStatsRepository.upsertDailyStats(userId, outsideWindow, 100, 0, 0, 0);

        UserPeriodStatsDTO stats = userPeriodStatsService.getStatsForLastDays(userId, 30);

        assertThat(stats.getReturnedBottleCount()).isEqualTo(5);
        assertThat(stats.getReturnedTotalCount()).isEqualTo(5);
        assertThat(stats.getPeriodDays()).isEqualTo(30);
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
