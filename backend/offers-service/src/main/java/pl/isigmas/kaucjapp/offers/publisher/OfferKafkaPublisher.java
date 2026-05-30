package pl.isigmas.kaucjapp.offers.publisher;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.offers.DTO.OfferCompletedEventDTO;

@Component
@RequiredArgsConstructor
public class OfferKafkaPublisher {

    private final KafkaTemplate<String, OfferCompletedEventDTO> kafkaTemplate;
    private final Logger logger;

    public void sendOfferCompleted(OfferCompletedEventDTO event) {
        kafkaTemplate.send("offers.completed", event.getOfferId().toString(), event);
        logger.important("Published offers.completed for offer ID: %d".formatted(event.getOfferId()));
    }
}
