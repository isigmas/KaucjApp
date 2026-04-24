package pl.isigmas.kaucjapp.offers.integration.lifecycle;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.offers.support.BaseIntegrationTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class OfferLifecycleEndpointTest extends BaseIntegrationTest {

    @Test
    void offerCrudAndStatusFlowWorks() throws Exception {
        Long creatorId = 1001L;
        Long collectorId = 2002L;

        String createOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "pickupAddress": "ul. Odbiorcza 1",
                    "pickupInstructions": "Zadzwonic po przybyciu",
                    "items": [
                      { "bottleId": %d, "quantity": 10, "unitPrice": 0.50 },
                      { "bottleId": %d, "quantity": 5,  "unitPrice": 0.30 }
                    ]
                }
                """.formatted(plasticBottleId, canBottleId);

        mockMvc.perform(post("/api/offer/offer")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isCreated());

        Long offerId = offerRepository.findAll().stream().findFirst().orElseThrow().getId();

        mockMvc.perform(get("/api/offer/my").header("X-User-Id", creatorId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].offer_id").value(offerId))
                .andExpect(jsonPath("$[0].creator_id").value(creatorId))
                .andExpect(jsonPath("$[0].status").value("OPEN"))
                .andExpect(jsonPath("$[0].plastic_quantity").value(10))
                .andExpect(jsonPath("$[0].can_quantity").value(5))
                .andExpect(jsonPath("$[0].total_quantity").value(15))
                .andExpect(jsonPath("$[0].plastic_price").value(0.50))
                .andExpect(jsonPath("$[0].can_price").value(0.30))
                .andExpect(jsonPath("$[0].total_prize").value(6.50))
                .andExpect(jsonPath("$[0].total_income").value(1.00));

        String updateOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "pickupAddress": "ul. Zmieniona 10",
                    "pickupInstructions": "Odbior po 18:00",
                    "items": [
                      { "bottleId": %d, "quantity": 8, "unitPrice": 0.50 },
                      { "bottleId": %d, "quantity": 3, "unitPrice": 0.25 }
                    ]
                }
                """.formatted(plasticBottleId, canBottleId);

        mockMvc.perform(patch("/api/offer/" + offerId)
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateOfferJson))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/offer/my")
                        .header("X-User-Id", creatorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].offer_id").value(offerId));

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/offer/my/reserved")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].offer_id").value(offerId));

        mockMvc.perform(delete("/api/offer/" + offerId)
                        .header("X-User-Id", creatorId))
                .andExpect(status().isOk());

        assertThat(offerRepository.findById(offerId)).isEmpty();
    }

    @Test
    void deletingNonExistingOfferReturns404() throws Exception {
        mockMvc.perform(delete("/api/offer/999999")
                        .header("X-User-Id", 1L))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletingOfferByNonCreatorReturns403() throws Exception {
        Long creatorId = 20001L;
        Long otherUserId = 20002L;

        String createOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "pickupAddress": "ul. Odbiorcza 1",
                    "pickupInstructions": "Test",
                    "items": [
                      { "bottleId": %d, "quantity": 1, "unitPrice": 0.10 }
                    ]
                }
                """.formatted(plasticBottleId);

        mockMvc.perform(post("/api/offer/offer")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isCreated());

        Long offerId = offerRepository.findAll().stream().findFirst().orElseThrow().getId();

        mockMvc.perform(delete("/api/offer/" + offerId)
                        .header("X-User-Id", otherUserId))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("OFFER_007"));
    }
}
