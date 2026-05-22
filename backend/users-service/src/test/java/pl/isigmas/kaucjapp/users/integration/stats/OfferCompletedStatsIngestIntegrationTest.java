package pl.isigmas.kaucjapp.users.integration.stats;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import pl.isigmas.kaucjapp.users.DTO.DailyStatsCounts;
import pl.isigmas.kaucjapp.users.listener.UsersKafkaListener;
import pl.isigmas.kaucjapp.users.model.UserStats;
import pl.isigmas.kaucjapp.users.repository.UserDailyStatsRepository;
import pl.isigmas.kaucjapp.users.repository.UserStatsRepository;
import pl.isigmas.kaucjapp.users.support.BaseIntegrationTest;

import java.time.LocalDate;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class OfferCompletedStatsIngestIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private UsersKafkaListener usersKafkaListener;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private UserDailyStatsRepository userDailyStatsRepository;

    @Test
    void offerCompleted_dualWritesLifetimeAndDailyBucket() throws Exception {
        Long creatorId = createUser(4001L, "creator01", "creator01@example.com");
        Long collectorId = createUser(4002L, "collector01", "collector01@example.com");
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        publishOfferCompleted(100L, creatorId, collectorId, 3, 2);

        UserStats creatorStats = userStatsRepository.findById(creatorId).orElseThrow();
        UserStats collectorStats = userStatsRepository.findById(collectorId).orElseThrow();

        assertThat(creatorStats.getReturnedPlasticCount()).isEqualTo(3);
        assertThat(creatorStats.getReturnedCanCount()).isEqualTo(2);
        assertThat(collectorStats.getCollectedPlasticCount()).isEqualTo(3);
        assertThat(collectorStats.getCollectedCanCount()).isEqualTo(2);

        DailyStatsCounts creatorBucket = userDailyStatsRepository.findDailyBucket(creatorId, today).orElseThrow();
        DailyStatsCounts collectorBucket = userDailyStatsRepository.findDailyBucket(collectorId, today).orElseThrow();

        assertThat(creatorBucket.getReturnedPlastic()).isEqualTo(3L);
        assertThat(creatorBucket.getReturnedCan()).isEqualTo(2L);
        assertThat(creatorBucket.getCollectedPlastic()).isZero();
        assertThat(creatorBucket.getCollectedCan()).isZero();

        assertThat(collectorBucket.getCollectedPlastic()).isEqualTo(3L);
        assertThat(collectorBucket.getCollectedCan()).isEqualTo(2L);
        assertThat(collectorBucket.getReturnedPlastic()).isZero();
        assertThat(collectorBucket.getReturnedCan()).isZero();
    }

    @Test
    void offerCompleted_duplicateEvent_isIdempotent() throws Exception {
        Long creatorId = createUser(4011L, "creator11", "creator11@example.com");
        Long collectorId = createUser(4012L, "collector11", "collector11@example.com");

        String eventJson = offerCompletedJson(200L, creatorId, collectorId, 5, 1);
        usersKafkaListener.handleOfferCompleted(eventJson);
        usersKafkaListener.handleOfferCompleted(eventJson);

        UserStats creatorStats = userStatsRepository.findById(creatorId).orElseThrow();
        assertThat(creatorStats.getReturnedPlasticCount()).isEqualTo(5);
        assertThat(creatorStats.getReturnedCanCount()).isEqualTo(1);
    }

    @Test
    void offerCompleted_sameDayMultipleOffers_accumulatesDailyBucket() throws Exception {
        Long creatorId = createUser(4021L, "creator21", "creator21@example.com");
        Long collectorId = createUser(4022L, "collector22", "collector22@example.com");
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        publishOfferCompleted(301L, creatorId, collectorId, 1, 0);
        publishOfferCompleted(302L, creatorId, collectorId, 2, 3);

        DailyStatsCounts creatorBucket = userDailyStatsRepository.findDailyBucket(creatorId, today).orElseThrow();
        assertThat(creatorBucket.getReturnedPlastic()).isEqualTo(3L);
        assertThat(creatorBucket.getReturnedCan()).isEqualTo(3L);

        UserStats creatorStats = userStatsRepository.findById(creatorId).orElseThrow();
        assertThat(creatorStats.getReturnedPlasticCount()).isEqualTo(3);
        assertThat(creatorStats.getReturnedCanCount()).isEqualTo(3);
    }

    private void publishOfferCompleted(Long offerId, Long creatorId, Long collectorId, int plastic, int cans) {
        usersKafkaListener.handleOfferCompleted(offerCompletedJson(offerId, creatorId, collectorId, plastic, cans));
    }

    private static String offerCompletedJson(Long offerId, Long creatorId, Long collectorId, int plastic, int cans) {
        return """
                {"offer_id":%d,"creator_id":%d,"collector_id":%d,"plastic_quantity":%d,"can_quantity":%d}
                """.formatted(offerId, creatorId, collectorId, plastic, cans);
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
