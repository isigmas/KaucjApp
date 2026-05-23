package pl.isigmas.kaucjapp.auth.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.auth.service.AuthService;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthKafkaListener {

    private final AuthService authService;

    @KafkaListener(topics = "users.deleted.event", groupId = "auth-group")
    public void handleUserDeleted(String idStr) {
        try {
            Long id = Long.valueOf(idStr.replace("\"", ""));
            log.info("Auth service received user deleted event for user ID: {}", id);
            authService.handleUserDeleted(id);
        } catch (Exception e) {
            log.error("Failed to handle user deleted message: {}", idStr, e);
        }
    }
}
