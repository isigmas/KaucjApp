package pl.isigmas.kaucjapp.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.OfferCompletedEventDTO;
import pl.isigmas.kaucjapp.users.repository.ProcessedOfferEventRepository;
import pl.isigmas.kaucjapp.users.repository.UserDailyStatsRepository;
import pl.isigmas.kaucjapp.users.repository.UserStatsRepository;

import java.time.LocalDate;
import java.time.ZoneOffset;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserStatsIngestService {

    private final UserStatsRepository userStatsRepository;
    private final UserDailyStatsRepository userDailyStatsRepository;
    private final ProcessedOfferEventRepository processedOfferEventRepository;
    private final Logger logger;

    @Transactional
    public void ingestOfferCompleted(OfferCompletedEventDTO event) {
        if (event.getOfferId() == null || event.getCreatorId() == null || event.getCollectorId() == null) {
            log.warn("Skipping offer completed event with missing ids: {}", event);
            logger.warn("Skipping offer completed event with missing ids: %s".formatted(event));
            return;
        }

        if (processedOfferEventRepository.tryMarkProcessed(event.getOfferId()) == 0) {
            log.warn("Duplicate offers.completed ignored: offerId={}, creatorId={}, collectorId={}",
                    event.getOfferId(), event.getCreatorId(), event.getCollectorId());
            logger.warn(
                    "Duplicate offers.completed ignored: offerId=%d, creatorId=%d, collectorId=%d"
                            .formatted(event.getOfferId(), event.getCreatorId(), event.getCollectorId())
            );
            return;
        }

        LocalDate statDate = LocalDate.now(ZoneOffset.UTC);
        int plastic = event.getPlasticQuantity();
        int cans = event.getCanQuantity();

        userStatsRepository.incrementReturnedStats(event.getCreatorId(), plastic, cans);
        userStatsRepository.incrementCollectedStats(event.getCollectorId(), plastic, cans);

        userDailyStatsRepository.upsertDailyStats(
                event.getCreatorId(),
                statDate,
                plastic,
                cans,
                0,
                0
        );

        userDailyStatsRepository.upsertDailyStats(
                event.getCollectorId(),
                statDate,
                0,
                0,
                plastic,
                cans
        );

        log.info(
                "Stats ingested for offerId={} statDate={}: creatorId={} returned +{} plastic, +{} cans; collectorId={} collected +{} plastic, +{} cans",
                event.getOfferId(),
                statDate,
                event.getCreatorId(),
                plastic,
                cans,
                event.getCollectorId(),
                plastic,
                cans
        );
        logger.info(
                "Stats ingested for offerId=%d statDate=%s: creatorId=%d returned +%d plastic, +%d cans; collectorId=%d collected +%d plastic, +%d cans"
                        .formatted(
                                event.getOfferId(),
                                statDate,
                                event.getCreatorId(),
                                plastic,
                                cans,
                                event.getCollectorId(),
                                plastic,
                                cans
                        )
        );
    }
}
