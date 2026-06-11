package pl.isigmas.kaucjapp.users.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.CreateUserDTO;
import pl.isigmas.kaucjapp.users.DTO.OfferCompletedEventDTO;
import pl.isigmas.kaucjapp.users.service.UserService;
import pl.isigmas.kaucjapp.users.service.UserStatsIngestService;

@Slf4j
@Component
@RequiredArgsConstructor
public class UsersKafkaListener {

    private final UserService userService;
    private final UserStatsIngestService userStatsIngestService;
    private final Logger logger;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "users.sync", groupId = "users-group")
    public void handleUserSync(String newUserJson) {
        try {
            CreateUserDTO newUser = objectMapper.readValue(newUserJson, CreateUserDTO.class);
            userService.createUser(newUser.getId(), newUser);
            log.info("Kafka users.sync processed for user ID: {}", newUser.getId());
            logger.info("Kafka users.sync processed for user ID: %d".formatted(newUser.getId()));
        } catch (Exception e) {
            log.error("Failed to parse user sync message: {}", newUserJson, e);
            logger.error("Failed to parse user sync message: %s".formatted(newUserJson));
        }
    }

    @KafkaListener(topics = "users.delete.command", groupId = "users-group")
    public void handleUserDeleteCommand(String idStr) {
        try {
            Long id = Long.valueOf(idStr.replace("\"", ""));
            log.info("Received command to delete user ID: {}", id);
            logger.info("Received command to delete user ID: %d".formatted(id));
            userService.deleteUser(id);
        } catch (Exception e) {
            log.error("Failed to parse user delete command: {}", idStr, e);
            logger.error("Failed to parse user delete command: %s".formatted(idStr));
        }
    }

    @KafkaListener(topics = "offers.completed", groupId = "users-group")
    public void handleOfferCompleted(String eventJson) {
        OfferCompletedEventDTO event;
        try {
            event = objectMapper.readValue(eventJson, OfferCompletedEventDTO.class);
        } catch (Exception e) {
            log.error("Failed to parse offer completed message: {}", eventJson, e);
            logger.error("Failed to parse offer completed message: %s".formatted(eventJson));
            return;
        }

        log.info(
                "Parsed offers.completed: offerId={}, creatorId={}, collectorId={}, plastic={}, cans={}",
                event.getOfferId(),
                event.getCreatorId(),
                event.getCollectorId(),
                event.getPlasticQuantity(),
                event.getCanQuantity()
        );

        try {
            userStatsIngestService.ingestOfferCompleted(event);
        } catch (Exception e) {
            log.error("Failed to ingest stats for offer completed message: {}", eventJson, e);
            logger.error("Failed to ingest stats for offer completed message: %s".formatted(eventJson));
        }
    }
}
