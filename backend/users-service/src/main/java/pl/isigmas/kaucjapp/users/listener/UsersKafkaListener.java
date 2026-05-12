package pl.isigmas.kaucjapp.users.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.users.DTO.CreateUserDTO;
import pl.isigmas.kaucjapp.users.DTO.OfferCompletedEventDTO;
import pl.isigmas.kaucjapp.users.repository.UserStatsRepository;
import pl.isigmas.kaucjapp.users.service.UserService;

@Slf4j
@Component
@RequiredArgsConstructor
public class UsersKafkaListener {

    private final UserService userService;
    private final UserStatsRepository userStatsRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "users.sync", groupId = "users-group")
    public void handleUserSync(String newUserJson) {
        try {
            CreateUserDTO newUser = objectMapper.readValue(newUserJson, CreateUserDTO.class);
            userService.createUser(newUser.getId(), newUser);
            log.info("New user created, ID: {}", newUser.getId());
        } catch (Exception e) {
            log.error("Failed to parse user sync message: {}", newUserJson, e);
            throw new RuntimeException("Error parsing users.sync message", e);
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
    public void handleOfferCompleted(OfferCompletedEventDTO event) {
        log.info("Received stats update for offerId: {}", event.getOfferId());

        userStatsRepository.incrementReturnedStats(
                event.getCreatorId(),
                event.getPlasticQuantity(),
                event.getCanQuantity()
        );

        userStatsRepository.incrementCollectedStats(
                event.getCollectorId(),
                event.getPlasticQuantity(),
                event.getCanQuantity()
        );

        log.info("Successfully updated stats for creator {} and collector {}", event.getCreatorId(), event.getCollectorId());
    }
}
