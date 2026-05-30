package pl.isigmas.kaucjapp.offers.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.common.logger.Logger;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompletingPendingOffersService {

    private final OfferService offerService;
    private final Logger logger;

    @Scheduled(fixedRate = 900000)
    @Transactional
    public void completePendingOffers() {
        Instant now = Instant.now();

        int completedCount = offerService.completeExpiredPendingOffers(now);

        if (completedCount > 0) {
            log.info("Completed {} pending offers (Kafka stats published per offer).", completedCount);
            logger.info("Completed %d pending offers (Kafka stats published per offer).".formatted(completedCount));
        }
    }
}
