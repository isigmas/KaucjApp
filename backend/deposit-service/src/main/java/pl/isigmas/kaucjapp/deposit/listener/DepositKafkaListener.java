package pl.isigmas.kaucjapp.deposit.listener;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.deposit.service.RatingService;

@Component
@RequiredArgsConstructor
public class DepositKafkaListener {

    private final RatingService ratingService;
    private final Logger logger;

    @KafkaListener(topics = "users.deleted.event", groupId = "deposit-group")
    public void handleUserDeleted(String idStr) {
        try {
            Long id = Long.valueOf(idStr.replace("\"", ""));
            logger.info("Kafka users.deleted.event processed for user ID: %d".formatted(id));
            ratingService.deleteUserInfo(id);
        } catch (Exception e) {
            logger.error("Failed to handle user deleted message: %s".formatted(idStr));
        }
    }
}
