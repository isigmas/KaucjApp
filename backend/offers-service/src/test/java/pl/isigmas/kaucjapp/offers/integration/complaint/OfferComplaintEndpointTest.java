package pl.isigmas.kaucjapp.offers.integration.complaint;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.offers.support.BaseIntegrationTest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class OfferComplaintEndpointTest extends BaseIntegrationTest {

    @Test
    void postComplaint_validPayload_returns200() throws Exception {
        // Given
        Long creatorId = 51001L;
        Long collectorId = 51002L;

        Long offerId = createOpenOffer(creatorId);

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        String payload = """
                {
                  "complaintReason": "OTHER",
                  "message": "Something went wrong"
                }
                """;

        // When / Then
        mockMvc.perform(post("/api/offer/complaint/" + offerId)
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(content().string(org.hamcrest.Matchers.matchesPattern("\\d+")));
    }

    @Test
    void postComplaint_missingComplaintReason_returns400() throws Exception {
        // Given
        Long creatorId = 52001L;
        Long collectorId = 52002L;

        Long offerId = createOpenOffer(creatorId);

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        String payload = """
                {
                  "message": "Something went wrong"
                }
                """;

        // When / Then
        mockMvc.perform(post("/api/offer/complaint/" + offerId)
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERR"));
    }

    private Long createOpenOffer(Long creatorId) throws Exception {
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

        return offerRepository.findAll().stream().findFirst().orElseThrow().getId();
    }
}

