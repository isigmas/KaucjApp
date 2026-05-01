package pl.isigmas.kaucjapp.users.listener;

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

    @KafkaListener(topics = "users.sync", groupId = "users-group")
    public void handleUserSync(CreateUserDTO newUser) {
        userService.createUser(newUser.getId(), newUser);
        log.info("New user created, ID: {}", newUser.getId());
    }

    @KafkaListener(topics = "users.delete", groupId = "users-group")
    public void handleUserDelete(Long id) {
        log.info("Admin requested delete of user ID: {}", id);
        userService.deleteUser(id);
    }
}
