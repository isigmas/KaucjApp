package pl.isigmas.kaucjapp.offers.publisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.offers.DTO.OfferCompletedEventDTO;

@Slf4j
@Component
@RequiredArgsConstructor
public class OfferKafkaPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final Logger logger;

    public void sendOfferCompleted(OfferCompletedEventDTO event) {
        kafkaTemplate.send("offers.completed", event.getOfferId().toString(), event);
        log.info("Published offers.completed for offer ID: {}", event.getOfferId());
        logger.important("Published offers.completed for offer ID: %d".formatted(event.getOfferId()));
    }
}
