package pl.isigmas.kaucjapp.offers.publisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.offers.DTO.OfferCompletedEventDTO;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OfferKafkaPublisher {

    private static final int PUBLISH_TIMEOUT_SECONDS = 30;

    private final KafkaTemplate<String, OfferCompletedEventDTO> kafkaTemplate;
    private final Logger logger;

    public void sendOfferCompleted(OfferCompletedEventDTO event) {
        try {
            kafkaTemplate
                    .send("offers.completed", event.getOfferId().toString(), event)
                    .get(PUBLISH_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            log.info(
                    "Published offers.completed for offer ID: {} (creator={}, collector={}, plastic={}, cans={})",
                    event.getOfferId(),
                    event.getCreatorId(),
                    event.getCollectorId(),
                    event.getPlasticQuantity(),
                    event.getCanQuantity()
            );
            logger.important("Published offers.completed for offer ID: %d".formatted(event.getOfferId()));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(
                    "Interrupted while publishing offers.completed for offer ID: " + event.getOfferId(),
                    e
            );
        } catch (ExecutionException | TimeoutException e) {
            throw new IllegalStateException(
                    "Failed to publish offers.completed for offer ID: " + event.getOfferId(),
                    e
            );
        }
    }
}
