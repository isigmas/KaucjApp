package pl.isigmas.kaucjapp.offers.publisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.offers.DTO.OfferCompletedEventDTO;

@Slf4j
@Component
@RequiredArgsConstructor
public class OfferKafkaPublisher {

    private final KafkaTemplate<String, OfferCompletedEventDTO> offerCompletedTemplate;

    public void sendOfferCompleted(OfferCompletedEventDTO event) {
        log.info("Sending OfferCompletedEvent for offerId: {}", event.getOfferId());
        offerCompletedTemplate.send("offers.completed", event.getOfferId().toString(), event);
    }
}