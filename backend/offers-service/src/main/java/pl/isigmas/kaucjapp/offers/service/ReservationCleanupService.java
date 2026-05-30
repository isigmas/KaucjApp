package pl.isigmas.kaucjapp.offers.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.offers.model.OfferStatus;
import pl.isigmas.kaucjapp.offers.repository.OfferRepository;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationCleanupService {

    private final OfferRepository offerRepository;
    private final Logger logger;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredReservations() {
        Instant now = Instant.now();

        int updatedCount = offerRepository.releaseExpiredReservations(
                OfferStatus.OPEN,
                OfferStatus.RESERVED,
                now
        );

        if (updatedCount > 0) {
            log.info("Released {} expired offer reservations.", updatedCount);
            logger.info("Released %d expired offer reservations.".formatted(updatedCount));
        }
    }
}
