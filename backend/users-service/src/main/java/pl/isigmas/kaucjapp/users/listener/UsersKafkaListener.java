package pl.isigmas.kaucjapp.users.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
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
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

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

    @KafkaListener(topics = "users.delete.command", groupId = "users-group")
    public void handleUserDeleteCommand(String idStr) {
        try {
            Long id = Long.valueOf(idStr.replace("\"", ""));
            log.info("Received command to delete user ID: {}", id);
            userService.deleteUser(id);
        } catch (Exception e) {
            log.error("Failed to parse user delete command: {}", idStr, e);
        }
    }

    @KafkaListener(topics = "offers.completed", groupId = "users-group")
    public void handleOfferCompleted(String eventJson) {
        try {
            OfferCompletedEventDTO event = objectMapper.readValue(eventJson, OfferCompletedEventDTO.class);
            userStatsIngestService.ingestOfferCompleted(event);
        } catch (Exception e) {
            log.error("Failed to parse offer completed message: {}", eventJson, e);
        }
    }
}
