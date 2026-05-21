package pl.isigmas.kaucjapp.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional
    public void ingestOfferCompleted(OfferCompletedEventDTO event) {
        if (event.getOfferId() == null || event.getCreatorId() == null || event.getCollectorId() == null) {
            log.warn("Skipping offer completed event with missing ids: {}", event);
            return;
        }

        if (processedOfferEventRepository.tryMarkProcessed(event.getOfferId()) == 0) {
            log.warn(
                    "Duplicate offers.completed ignored: offerId={}, creatorId={}, collectorId={}",
                    event.getOfferId(),
                    event.getCreatorId(),
                    event.getCollectorId()
            );
            return;
        }

        LocalDate statDate = LocalDate.now(ZoneOffset.UTC);
        int bottles = event.getBottleQuantity();
        int cans = event.getCanQuantity();

        userStatsRepository.incrementReturnedStats(event.getCreatorId(), bottles, cans);
        userStatsRepository.incrementCollectedStats(event.getCollectorId(), bottles, cans);

        userDailyStatsRepository.upsertDailyStats(
                event.getCreatorId(),
                statDate,
                bottles,
                cans,
                0,
                0
        );

        userDailyStatsRepository.upsertDailyStats(
                event.getCollectorId(),
                statDate,
                0,
                0,
                bottles,
                cans
        );

        log.info(
                "Stats ingested for offerId={} statDate={}: creatorId={} returned +{} bottles, +{} cans; collectorId={} collected +{} bottles, +{} cans",
                event.getOfferId(),
                statDate,
                event.getCreatorId(),
                bottles,
                cans,
                event.getCollectorId(),
                bottles,
                cans
        );
    }
}
