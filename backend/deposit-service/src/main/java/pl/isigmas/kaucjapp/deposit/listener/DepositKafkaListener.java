package pl.isigmas.kaucjapp.deposit.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.deposit.service.RatingService;

@Slf4j
@Component
@RequiredArgsConstructor
public class DepositKafkaListener {

    private final RatingService ratingService;
    private final Logger logger;

    @KafkaListener(topics = "users.deleted.event", groupId = "deposit-group")
    public void handleUserDeleted(String idStr) {
        try {
            Long id = Long.valueOf(idStr.replace("\"", ""));
            log.info("Deposit service received user deleted event for user ID: {}", id);
            logger.info("Kafka users.deleted.event processed for user ID: %d".formatted(id));
            ratingService.deleteUserInfo(id);
        } catch (Exception e) {
            log.error("Failed to handle user deleted message: {}", idStr, e);
            logger.error("Failed to handle user deleted message: %s".formatted(idStr));
        }
    }
}
