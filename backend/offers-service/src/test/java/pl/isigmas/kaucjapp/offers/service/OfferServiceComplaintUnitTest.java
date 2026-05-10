package pl.isigmas.kaucjapp.offers.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.offers.DTO.ComplaintDTO;
import pl.isigmas.kaucjapp.offers.exception.OfferForbiddenException;
import pl.isigmas.kaucjapp.offers.exception.OfferNotFoundException;
import pl.isigmas.kaucjapp.offers.exception.OfferStateException;
import pl.isigmas.kaucjapp.offers.model.*;
import pl.isigmas.kaucjapp.offers.repository.BottleTypeRepository;
import pl.isigmas.kaucjapp.offers.repository.ComplaintRepository;
import pl.isigmas.kaucjapp.offers.repository.OfferRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OfferServiceComplaintUnitTest {

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private BottleTypeRepository bottleTypeRepository;

    @Mock
    private GeoValidationService geoValidationService;

    @Mock
    private ComplaintRepository complaintRepository;

    @InjectMocks
    private OfferService offerService;

    @Test
    void addComplaint_asCollector_success_setsStatusAndSavesComplaint() {
        // Given
        long offerId = 10L;
        long creatorId = 11L;
        long collectorId = 12L;

        Offer offer = new Offer();
        offer.setId(offerId);
        offer.setCreatorId(creatorId);
        offer.setCollectorId(collectorId);
        offer.setStatus(OfferStatus.PENDING_CONFIRMATION);
        offer.setConfirmationDeadline(java.time.Instant.now().plusSeconds(3600));

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));
        when(complaintRepository.save(any(OfferComplaint.class))).thenAnswer(inv -> {
            OfferComplaint c = inv.getArgument(0);
            c.setId(999L);
            return c;
        });

        ComplaintDTO dto = new ComplaintDTO(ComplaintReason.OTHER, "Some message");

        // When
        Long createdId = offerService.addComplaint(collectorId, offerId, dto);

        // Then
        assertThat(createdId).isEqualTo(999L);
        assertThat(offer.getStatus()).isEqualTo(OfferStatus.COMPLAINT);
        assertThat(offer.getConfirmationDeadline()).isNull();

        ArgumentCaptor<OfferComplaint> complaintCaptor = ArgumentCaptor.forClass(OfferComplaint.class);
        verify(complaintRepository).save(complaintCaptor.capture());

        OfferComplaint saved = complaintCaptor.getValue();
        assertThat(saved.getOffer()).isSameAs(offer);
        assertThat(saved.getComplainant()).isEqualTo(Complainant.COLLECTOR);
        assertThat(saved.getComplaintReason()).isEqualTo(ComplaintReason.OTHER);
        assertThat(saved.getMessage()).isEqualTo("Some message");
    }

    @Test
    void addComplaint_asCreator_success_setsStatusAndSavesComplaint() {
        // Given
        long offerId = 20L;
        long creatorId = 21L;
        long collectorId = 22L;

        Offer offer = new Offer();
        offer.setId(offerId);
        offer.setCreatorId(creatorId);
        offer.setCollectorId(collectorId);
        offer.setStatus(OfferStatus.RESERVED);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));
        when(complaintRepository.save(any(OfferComplaint.class))).thenAnswer(inv -> {
            OfferComplaint c = inv.getArgument(0);
            c.setId(1000L);
            return c;
        });

        ComplaintDTO dto = new ComplaintDTO(ComplaintReason.TROUBLE_WITH_OTHER_USER, "No show");

        // When
        Long createdId = offerService.addComplaint(creatorId, offerId, dto);

        // Then
        assertThat(createdId).isEqualTo(1000L);
        assertThat(offer.getStatus()).isEqualTo(OfferStatus.COMPLAINT);
        assertThat(offer.getConfirmationDeadline()).isNull();

        ArgumentCaptor<OfferComplaint> complaintCaptor = ArgumentCaptor.forClass(OfferComplaint.class);
        verify(complaintRepository).save(complaintCaptor.capture());
        assertThat(complaintCaptor.getValue().getComplainant()).isEqualTo(Complainant.CREATOR);
    }

    @Test
    void addComplaint_offerInInvalidStatus_throwsOfferStateException() {
        // Given
        long offerId = 30L;
        long creatorId = 31L;
        long collectorId = 32L;

        Offer offer = new Offer();
        offer.setId(offerId);
        offer.setCreatorId(creatorId);
        offer.setCollectorId(collectorId);
        offer.setStatus(OfferStatus.OPEN);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));

        ComplaintDTO dto = new ComplaintDTO(ComplaintReason.OTHER, "msg");

        // When / Then
        assertThatThrownBy(() -> offerService.addComplaint(creatorId, offerId, dto))
                .isInstanceOf(OfferStateException.class);

        verify(complaintRepository, never()).save(any());
    }

    @Test
    void addComplaint_byThirdParty_throwsOfferForbiddenException() {
        // Given
        long offerId = 40L;
        long creatorId = 41L;
        long collectorId = 42L;
        long outsiderId = 43L;

        Offer offer = new Offer();
        offer.setId(offerId);
        offer.setCreatorId(creatorId);
        offer.setCollectorId(collectorId);
        offer.setStatus(OfferStatus.RESERVED);

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(offer));

        ComplaintDTO dto = new ComplaintDTO(ComplaintReason.OTHER, "msg");

        // When / Then
        assertThatThrownBy(() -> offerService.addComplaint(outsiderId, offerId, dto))
                .isInstanceOf(OfferForbiddenException.class);

        verify(complaintRepository, never()).save(any());
    }

    @Test
    void addComplaint_offerNotFound_throwsOfferNotFoundException() {
        // Given
        long offerId = 50L;
        when(offerRepository.findById(offerId)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> offerService.addComplaint(1L, offerId, new ComplaintDTO(ComplaintReason.OTHER, "x")))
                .isInstanceOf(OfferNotFoundException.class);
    }
}

