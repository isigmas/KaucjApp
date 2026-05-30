package pl.isigmas.kaucjapp.users.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.OfferCompletedEventDTO;
import pl.isigmas.kaucjapp.users.repository.ProcessedOfferEventRepository;
import pl.isigmas.kaucjapp.users.repository.UserDailyStatsRepository;
import pl.isigmas.kaucjapp.users.repository.UserStatsRepository;

import java.time.LocalDate;
import java.time.ZoneOffset;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserStatsIngestServiceTest {

    @Mock
    private UserStatsRepository userStatsRepository;

    @Mock
    private UserDailyStatsRepository userDailyStatsRepository;

    @Mock
    private ProcessedOfferEventRepository processedOfferEventRepository;

    @Mock
    private Logger logger;

    @InjectMocks
    private UserStatsIngestService userStatsIngestService;

    @Test
    void ingestOfferCompleted_updatesLifetimeAndDailyBuckets() {
        OfferCompletedEventDTO event = OfferCompletedEventDTO.builder()
                .offerId(1L)
                .creatorId(10L)
                .collectorId(20L)
                .plasticQuantity(3)
                .canQuantity(2)
                .build();

        when(processedOfferEventRepository.tryMarkProcessed(1L)).thenReturn(1);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        userStatsIngestService.ingestOfferCompleted(event);

        verify(userStatsRepository).incrementReturnedStats(10L, 3, 2);
        verify(userStatsRepository).incrementCollectedStats(20L, 3, 2);
        verify(userDailyStatsRepository).upsertDailyStats(10L, today, 3, 2, 0, 0);
        verify(userDailyStatsRepository).upsertDailyStats(20L, today, 0, 0, 3, 2);
    }

    @Test
    void ingestOfferCompleted_duplicateOfferId_skipsAllUpdates() {
        OfferCompletedEventDTO event = OfferCompletedEventDTO.builder()
                .offerId(99L)
                .creatorId(10L)
                .collectorId(20L)
                .plasticQuantity(1)
                .canQuantity(1)
                .build();

        when(processedOfferEventRepository.tryMarkProcessed(99L)).thenReturn(0);

        userStatsIngestService.ingestOfferCompleted(event);

        verifyNoInteractions(userStatsRepository, userDailyStatsRepository);
    }

    @Test
    void ingestOfferCompleted_missingIds_skipsProcessing() {
        OfferCompletedEventDTO event = OfferCompletedEventDTO.builder()
                .offerId(null)
                .creatorId(10L)
                .collectorId(20L)
                .build();

        userStatsIngestService.ingestOfferCompleted(event);

        verifyNoInteractions(processedOfferEventRepository, userStatsRepository, userDailyStatsRepository);
    }
}
