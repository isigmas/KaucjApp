package pl.isigmas.kaucjapp.offers.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.offers.model.OfferStatus;
import pl.isigmas.kaucjapp.offers.repository.OfferRepository;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationCleanupService {

    private final OfferRepository offerRepository;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredReservations() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(120);

        int updatedCount = offerRepository.releaseExpiredReservations(
                OfferStatus.OPEN,
                OfferStatus.RESERVED,
                expirationTime
        );

        if (updatedCount > 0) {
            log.info("Released {} expired offer reservations.", updatedCount);
        }
    }
}