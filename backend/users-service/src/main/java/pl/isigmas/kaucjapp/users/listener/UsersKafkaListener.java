package pl.isigmas.kaucjapp.users.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.users.DTO.CreateUserDTO;
import pl.isigmas.kaucjapp.users.DTO.OfferCompletedEventDTO;
import pl.isigmas.kaucjapp.users.repository.UserDailyStatsRepository;
import pl.isigmas.kaucjapp.users.repository.UserStatsRepository;
import pl.isigmas.kaucjapp.users.service.UserService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class UsersKafkaListener {

    private final UserService userService;
    private final UserStatsRepository userStatsRepository;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final UserDailyStatsRepository userDailyStatsRepository;

    @KafkaListener(topics = "users.sync", groupId = "users-group")
    public void handleUserSync(String newUserJson) {
        try {
            CreateUserDTO newUser = objectMapper.readValue(newUserJson, CreateUserDTO.class);
            userService.createUser(newUser.getId(), newUser);
            log.info("New user created, ID: {}", newUser.getId());
        } catch (Exception e) {
            log.error("Failed to parse user sync message: {}", newUserJson, e);
        }
    }

    @KafkaListener(topics = "users.delete", groupId = "users-group")
    public void handleUserDelete(String idStr) {
        try {
            Long id = Long.valueOf(idStr.replace("\"", ""));
            log.info("Admin requested delete of user ID: {}", id);
            userService.deleteUser(id);
        } catch (Exception e) {
            log.error("Failed to parse user delete message: {}", idStr, e);
            throw new RuntimeException("Error parsing users.delete message", e);
        }
    }

    @KafkaListener(topics = "offers.completed", groupId = "users-group")
    @Transactional
    public void handleOfferCompleted(String eventJson) {
        try {
            OfferCompletedEventDTO event = objectMapper.readValue(eventJson, OfferCompletedEventDTO.class);
            Instant today = Instant.now().truncatedTo(ChronoUnit.DAYS);

            userDailyStatsRepository.upsertDailyStats(
                    event.getCreatorId(), today,
                    event.getPlasticQuantity(), event.getCanQuantity(),
                    0, 0
            );

            userDailyStatsRepository.upsertDailyStats(
                    event.getCollectorId(), today,
                    0, 0,
                    event.getPlasticQuantity(), event.getCanQuantity()
            );

        } catch (Exception e) {
            log.error("Failed to parse offer completed message: {}", eventJson, e);
        }
    }
}