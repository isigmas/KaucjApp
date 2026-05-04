package pl.isigmas.kaucjapp.offers.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.offers.model.OfferStatus;
import pl.isigmas.kaucjapp.offers.repository.OfferRepository;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompletingPendingOffersService {

    private final OfferRepository offerRepository;

    @Scheduled(fixedRate = 900000)
    @Transactional
    public void completePendingOffers() {
        Instant now = Instant.now();

        int completedCount = offerRepository.completePendingOffers(
                OfferStatus.PENDING_CONFIRMATION,
                OfferStatus.COMPLETED,
                now
        );

        if (completedCount > 0) {
            log.info("Completed {} pending offers.", completedCount);
        }
    }
}