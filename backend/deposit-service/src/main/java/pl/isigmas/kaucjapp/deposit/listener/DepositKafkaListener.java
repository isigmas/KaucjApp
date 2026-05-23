package pl.isigmas.kaucjapp.deposit.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.deposit.service.RatingService;

@Slf4j
@Component
@RequiredArgsConstructor
public class DepositKafkaListener {

    private final RatingService ratingService;

    @KafkaListener(topics = "users.delete", groupId = "deposit-group")
    public void handleUserDelete(String idStr) {
        try {
            Long id = Long.valueOf(idStr.replace("\"", ""));
            log.info("Deposit service received delete event for user ID: {}", id);
            ratingService.deleteUserInfo(id);
        } catch (Exception e) {
            log.error("Failed to parse user delete message: {}", idStr, e);
            throw new RuntimeException("Error parsing users.delete message", e);
        }
    }
}