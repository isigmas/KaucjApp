package pl.isigmas.kaucjapp.offers.integration.geo;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.offers.support.BaseIntegrationTest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class OfferGeoValidationEndpointTest extends BaseIntegrationTest {

    @Test
    void creatingOfferOutsideOfPolandReturns400() throws Exception {
        Long creatorId = 11000L;
        String createOfferJson = """
                    {
                        "latitude": 55.2297,
                        "longitude": 24.0122,
                        "pickup_address": "ul. Daleko 1",
                        "items": [
                            { "bottle_id": %d, "quantity": 1, "unit_price": 0.10 }
                            ]
                    }
                    """;
        mockMvc.perform(post("/api/offer/offer")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson.formatted(plasticBottleId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("OFFER_003"));
    }

    @Test
    void patchingOfferToLocationOutsidePolandReturns400() throws Exception {
        Long creatorId = 19001L;

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

        String moveOutsidePoland = """
                {
                    "latitude": 55.2297,
                    "longitude": 24.0122
                }
                """;

        mockMvc.perform(patch("/api/offer/" + offerId)
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(moveOutsidePoland))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("OFFER_003"));
    }
}
