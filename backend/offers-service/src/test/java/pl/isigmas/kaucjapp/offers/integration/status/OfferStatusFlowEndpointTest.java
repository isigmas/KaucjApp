package pl.isigmas.kaucjapp.offers.integration.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.offers.support.BaseIntegrationTest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class OfferStatusFlowEndpointTest extends BaseIntegrationTest {

    @Test
    void changeOfferStatusWithInvalidStatusReturns400() throws Exception {
        Long creatorId = 4444L;
        Long collectorId = 5555L;

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

        Long offerId = offerRepository.findAll().stream().findFirst().orElseThrow().getId();

        mockMvc.perform(post("/api/offer/" + offerId + "/status/NOT_A_STATUS")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cannotReserveYourOwnOfferReturns403() throws Exception {
        Long creatorId = 6666L;

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

        Long offerId = offerRepository.findAll().stream().findFirst().orElseThrow().getId();

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", creatorId))
                .andExpect(status().isForbidden());
    }

    @Test
    void changingStatusFromOpenDirectlyToCompletedReturns409() throws Exception {
        Long creatorId = 13001L;
        Long collectorId = 13002L;

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

        Long offerId = offerRepository.findAll().stream().findFirst().orElseThrow().getId();

        mockMvc.perform(post("/api/offer/" + offerId + "/status/COMPLETED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isConflict());
    }

    @Test
    void reservingOfferAlreadyReservedBySomeoneElseReturns409() throws Exception {
        Long creatorId = 14001L;
        Long firstCollectorId = 14002L;
        Long secondCollectorId = 14003L;

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

        Long offerId = offerRepository.findAll().stream().findFirst().orElseThrow().getId();

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", firstCollectorId))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", secondCollectorId))
                .andExpect(status().isConflict());
    }

    @Test
    void completingOfferByNonCollectorReturns403() throws Exception {
        Long creatorId = 15001L;
        Long collectorId = 15002L;
        Long someoneElseId = 15003L;

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

        Long offerId = offerRepository.findAll().stream().findFirst().orElseThrow().getId();

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/offer/" + offerId + "/status/COMPLETED")
                        .header("X-User-Id", someoneElseId))
                .andExpect(status().isForbidden());
    }
}
