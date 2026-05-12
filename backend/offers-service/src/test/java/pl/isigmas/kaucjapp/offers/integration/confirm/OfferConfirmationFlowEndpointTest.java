package pl.isigmas.kaucjapp.offers.integration.confirm;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import pl.isigmas.kaucjapp.offers.model.Offer;
import pl.isigmas.kaucjapp.offers.model.OfferStatus;
import pl.isigmas.kaucjapp.offers.service.CompletingPendingOffersService;
import pl.isigmas.kaucjapp.offers.support.BaseIntegrationTest;

import java.time.Duration;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class OfferConfirmationFlowEndpointTest extends BaseIntegrationTest {

    @Autowired
    private CompletingPendingOffersService completingPendingOffersService;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void firstConfirmationSetsPendingAndDeadlineSecondCompletes() throws Exception {
        Long creatorId = 5001L;
        Long collectorId = 5002L;

        Long offerId = createOpenOffer(creatorId);

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        Instant beforeConfirm = Instant.now();
        mockMvc.perform(post("/api/offer/confirm/" + offerId)
                        .header("X-User-Id", creatorId))
                .andExpect(status().isOk());

        Offer afterCreatorConfirm = offerRepository.findById(offerId).orElseThrow();
        assertThat(afterCreatorConfirm.getStatus()).isEqualTo(OfferStatus.PENDING_CONFIRMATION);
        assertThat(afterCreatorConfirm.getCreatorConfirmed()).isTrue();
        assertThat(afterCreatorConfirm.getCollectorConfirmed()).isFalse();
        assertThat(afterCreatorConfirm.getConfirmationDeadline()).isNotNull();
        assertThat(afterCreatorConfirm.getConfirmationDeadline())
                .isAfterOrEqualTo(beforeConfirm.plus(Duration.ofHours(24)).minus(Duration.ofMinutes(1)))
                .isBeforeOrEqualTo(beforeConfirm.plus(Duration.ofHours(24)).plus(Duration.ofMinutes(1)));

        Instant beforeSecondConfirm = Instant.now();
        mockMvc.perform(post("/api/offer/confirm/" + offerId)
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        Offer afterCollectorConfirm = offerRepository.findById(offerId).orElseThrow();
        assertThat(afterCollectorConfirm.getStatus()).isEqualTo(OfferStatus.COMPLETED);
        assertThat(afterCollectorConfirm.getCreatorConfirmed()).isTrue();
        assertThat(afterCollectorConfirm.getCollectorConfirmed()).isTrue();
        assertThat(afterCollectorConfirm.getConfirmationDeadline()).isNull();
        assertThat(afterCollectorConfirm.getTimeCompleted()).isNotNull();
        assertThat(afterCollectorConfirm.getTimeCompleted()).isAfterOrEqualTo(beforeSecondConfirm.minusSeconds(5));
    }

    @Test
    void changeStatusToOpenClearsConfirmationFlagsAndDeadline() throws Exception {
        Long creatorId = 6001L;
        Long collectorId = 6002L;

        Long offerId = createOpenOffer(creatorId);

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/offer/confirm/" + offerId)
                        .header("X-User-Id", creatorId))
                .andExpect(status().isOk());

        Offer pending = offerRepository.findById(offerId).orElseThrow();
        assertThat(pending.getStatus()).isEqualTo(OfferStatus.PENDING_CONFIRMATION);
        assertThat(pending.getCreatorConfirmed()).isTrue();
        assertThat(pending.getConfirmationDeadline()).isNotNull();

        mockMvc.perform(post("/api/offer/" + offerId + "/status/OPEN")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        Offer backToOpen = offerRepository.findById(offerId).orElseThrow();
        assertThat(backToOpen.getStatus()).isEqualTo(OfferStatus.OPEN);
        assertThat(backToOpen.getCreatorConfirmed()).isFalse();
        assertThat(backToOpen.getCollectorConfirmed()).isFalse();
        assertThat(backToOpen.getConfirmationDeadline()).isNull();
    }

    @Test
    void changeStatusToComplaintStopsDeadlineCountdown() throws Exception {
        Long creatorId = 7001L;
        Long collectorId = 7002L;

        Long offerId = createOpenOffer(creatorId);

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/offer/confirm/" + offerId)
                        .header("X-User-Id", creatorId))
                .andExpect(status().isOk());

        Offer pending = offerRepository.findById(offerId).orElseThrow();
        assertThat(pending.getStatus()).isEqualTo(OfferStatus.PENDING_CONFIRMATION);
        assertThat(pending.getConfirmationDeadline()).isNotNull();

        String complaintPayload = """
                {
                  "complaint_reason": "OTHER",
                  "message": "Issue during handover"
                }
                """;

        mockMvc.perform(post("/api/offer/complaint/" + offerId)
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(complaintPayload))
                .andExpect(status().isCreated());

        Offer complaint = offerRepository.findById(offerId).orElseThrow();
        assertThat(complaint.getStatus()).isEqualTo(OfferStatus.COMPLAINT);
        assertThat(complaint.getConfirmationDeadline()).isNull();
    }

    @Test
    void scheduledCompleterClosesExpiredPendingOffers() throws Exception {
        Long creatorId = 8001L;
        Long collectorId = 8002L;

        Long offerId = createOpenOffer(creatorId);

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/offer/confirm/" + offerId)
                        .header("X-User-Id", creatorId))
                .andExpect(status().isOk());

        Offer pending = offerRepository.findById(offerId).orElseThrow();
        assertThat(pending.getStatus()).isEqualTo(OfferStatus.PENDING_CONFIRMATION);

        pending.setConfirmationDeadline(Instant.now().minus(Duration.ofHours(1)));
        offerRepository.saveAndFlush(pending);

        completingPendingOffersService.completePendingOffers();

        entityManager.flush();
        entityManager.clear();
        Offer completed = offerRepository.findById(offerId).orElseThrow();
        assertThat(completed.getStatus()).isEqualTo(OfferStatus.COMPLETED);
        assertThat(completed.getConfirmationDeadline()).isNull();
        assertThat(completed.getTimeCompleted()).isNotNull();
    }

    @Test
    void confirmingOfferByUserOutsideOfferReturns403() throws Exception {
        Long creatorId = 9001L;
        Long collectorId = 9002L;
        Long outsiderId = 9003L;

        Long offerId = createOpenOffer(creatorId);

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/offer/confirm/" + offerId)
                        .header("X-User-Id", outsiderId))
                .andExpect(status().isForbidden());
    }

    @Test
    void confirmingOfferInInvalidStatusReturns409() throws Exception {
        Long creatorId = 9101L;

        Long offerId = createOpenOffer(creatorId);

        mockMvc.perform(post("/api/offer/confirm/" + offerId)
                        .header("X-User-Id", creatorId))
                .andExpect(status().isForbidden());
        }

    private Long createOpenOffer(Long creatorId) throws Exception {
        String createOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "pickup_address": "ul. Odbiorcza 1",
                    "pickup_instructions": "Test",
                    "items": [
                      { "bottle_id": %d, "quantity": 1, "unit_price": 0.10 }
                    ]
                }
                """.formatted(plasticBottleId);

        mockMvc.perform(post("/api/offer/offer")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isCreated());

        return offerRepository.findAll().stream().findFirst().orElseThrow().getId();
    }
}

