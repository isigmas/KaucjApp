package pl.isigmas.kaucjapp.users.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.users.DTO.CreateUserDTO;
import pl.isigmas.kaucjapp.users.service.UserService;

@Slf4j
@Component
@RequiredArgsConstructor
public class UsersKafkaListener {

    private final UserService userService;
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
}
