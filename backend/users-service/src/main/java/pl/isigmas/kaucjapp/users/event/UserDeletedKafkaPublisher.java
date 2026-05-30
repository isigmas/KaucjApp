package pl.isigmas.kaucjapp.users.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import pl.isigmas.kaucjapp.common.logger.Logger;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserDeletedKafkaPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final Logger logger;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publishUserDeleted(UserDeletedEvent event) {
        kafkaTemplate.send("users.deleted.event", String.valueOf(event.userId()));
        log.info("Published users.deleted.event for user ID: {}", event.userId());
        logger.important("Published users.deleted.event for user ID: %d".formatted(event.userId()));
    }
}
