package pl.isigmas.kaucjapp.offers.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.offers.DTO.OfferCompletedEventDTO;
import pl.isigmas.kaucjapp.offers.model.BottleType;
import pl.isigmas.kaucjapp.offers.model.Offer;
import pl.isigmas.kaucjapp.offers.model.OfferItem;
import pl.isigmas.kaucjapp.offers.model.OfferStatus;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.offers.publisher.OfferKafkaPublisher;
import pl.isigmas.kaucjapp.offers.repository.BottleTypeRepository;
import pl.isigmas.kaucjapp.offers.repository.ComplaintRepository;
import pl.isigmas.kaucjapp.offers.repository.OfferRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfferServiceKafkaUnitTest {

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private BottleTypeRepository bottleTypeRepository;

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private GeoValidationService geoValidationService;

    @Mock
    private OfferKafkaPublisher offerKafkaPublisher;

    @Mock
    private Logger logger;

    @InjectMocks
    private OfferService offerService;

    @Test
    void confirmOffer_whenBothPartiesConfirm_sendsOfferCompletedOnceWithCorrectPayload() {
        // Given
        long offerId = 100L;
        long creatorId = 10L;
        long collectorId = 20L;

        BottleType plasticType = new BottleType();
        plasticType.setId(1L);
        plasticType.setName("plastic");

        BottleType canType = new BottleType();
        canType.setId(2L);
        canType.setName("can");

        Offer offer = new Offer();
        offer.setId(offerId);
        offer.setCreatorId(creatorId);
        offer.setCollectorId(collectorId);
        offer.setStatus(OfferStatus.RESERVED);

        OfferItem plasticItem = new OfferItem();
        plasticItem.setRelations(offer, plasticType);
        plasticItem.setQuantity(3);
        plasticItem.setUnitPrice(BigDecimal.valueOf(0.5));
        offer.addItem(plasticItem);

        OfferItem canItem = new OfferItem();
        canItem.setRelations(offer, canType);
        canItem.setQuantity(2);
        canItem.setUnitPrice(BigDecimal.valueOf(0.5));
        offer.addItem(canItem);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));

        // When — first confirmation (creator only)
        offerService.confirmOffer(offerId, creatorId);

        // Then
        verify(offerKafkaPublisher, never()).sendOfferCompleted(any());

        // When — second confirmation (collector completes the deal)
        offerService.confirmOffer(offerId, collectorId);

        // Then
        verify(offerKafkaPublisher, times(1)).sendOfferCompleted(any());

        ArgumentCaptor<OfferCompletedEventDTO> captor = ArgumentCaptor.forClass(OfferCompletedEventDTO.class);
        verify(offerKafkaPublisher).sendOfferCompleted(captor.capture());
        OfferCompletedEventDTO sent = captor.getValue();
        assertThat(sent.getOfferId()).isEqualTo(offerId);
        assertThat(sent.getCreatorId()).isEqualTo(creatorId);
        assertThat(sent.getCollectorId()).isEqualTo(collectorId);
        assertThat(sent.getPlasticQuantity()).isEqualTo(3);
        assertThat(sent.getCanQuantity()).isEqualTo(2);
    }

    @Test
    void completeExpiredPendingOffers_forEachExpiredOffer_sendsOfferCompleted() {
        // Given
        long offerId = 200L;
        long creatorId = 11L;
        long collectorId = 22L;

        BottleType plasticType = new BottleType();
        plasticType.setId(1L);
        plasticType.setName("plastic");

        Offer offer = new Offer();
        offer.setId(offerId);
        offer.setCreatorId(creatorId);
        offer.setCollectorId(collectorId);
        offer.setStatus(OfferStatus.PENDING_CONFIRMATION);

        OfferItem plasticItem = new OfferItem();
        plasticItem.setRelations(offer, plasticType);
        plasticItem.setQuantity(5);
        plasticItem.setUnitPrice(BigDecimal.valueOf(0.1));
        offer.addItem(plasticItem);

        when(offerRepository.findAllPendingOffersPastDeadline(OfferStatus.PENDING_CONFIRMATION, Instant.EPOCH))
                .thenReturn(List.of(offer));

        // When
        int completed = offerService.completeExpiredPendingOffers(Instant.EPOCH);

        // Then
        assertThat(completed).isEqualTo(1);
        verify(offerKafkaPublisher, times(1)).sendOfferCompleted(any());
        ArgumentCaptor<OfferCompletedEventDTO> captor = ArgumentCaptor.forClass(OfferCompletedEventDTO.class);
        verify(offerKafkaPublisher).sendOfferCompleted(captor.capture());
        assertThat(captor.getValue().getPlasticQuantity()).isEqualTo(5);
        assertThat(captor.getValue().getCanQuantity()).isZero();
    }
}
