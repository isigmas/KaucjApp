package pl.isigmas.kaucjapp.offers.integration.create;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.offers.support.BaseIntegrationTest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class OfferCreationEndpointTest extends BaseIntegrationTest {

    @Test
    void creatingOfferWithZeroQuantityReturns400() throws Exception {
        Long creatorId = 9999L;

        String createOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "pickupAddress": "ul. Odbiorcza 1",
                    "pickupInstructions": "Test",
                    "items": [
                      { "bottleId": %d, "quantity": 0, "unitPrice": 0.10 }
                    ]
                }
                """.formatted(plasticBottleId);

        mockMvc.perform(post("/api/offer/offer")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void creatingOfferWithPriceLowerThanZeroUnitPriceReturns400() throws Exception {
        Long creatorId = 10000L;

        String createOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "pickupAddress": "ul. Odbiorcza 1",
                    "pickupInstructions": "Test",
                    "items": [
                      { "bottleId": %d, "quantity": 1, "unitPrice": -1.00 }
                    ]
                }
                """.formatted(plasticBottleId);

        mockMvc.perform(post("/api/offer/offer")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void creatingOfferWithUnitPriceAboveMaximumReturns400() throws Exception {
        Long creatorId = 17001L;

        String createOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "pickupAddress": "ul. Odbiorcza 1",
                    "pickupInstructions": "Test",
                    "items": [
                      { "bottleId": %d, "quantity": 1, "unitPrice": 0.51 }
                    ]
                }
                """.formatted(plasticBottleId);

        mockMvc.perform(post("/api/offer/offer")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERR"));
    }

    @Test
    void creatingEmptyOfferReturns400() throws Exception {
        Long creatorId = 11000L;
        String createOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122
                }
                """;
        mockMvc.perform(post("/api/offer/offer")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void creatingOfferWithBlankPickupAddressReturns400() throws Exception {
        Long creatorId = 11001L;
        String createOfferJson = """
                    {
                        "latitude": 52.2297,
                        "longitude": 21.0122,
                        "pickupAddress": "",
                        "items": [
                            { "bottleId": %d, "quantity": 1, "unitPrice": 0.10 }
                            ]
                    }
                    """;
        mockMvc.perform(post("/api/offer/offer")
                            .header("X-User-Id", creatorId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createOfferJson.formatted(plasticBottleId)))
                    .andExpect(status().isBadRequest());
    }

    @Test
    void creatingOfferWithUnknownBottleTypeReturns404() throws Exception {
        Long creatorId = 18001L;

        String createOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "pickupAddress": "ul. Odbiorcza 1",
                    "pickupInstructions": "Test",
                    "items": [
                      { "bottleId": 999999999, "quantity": 1, "unitPrice": 0.10 }
                    ]
                }
                """;

        mockMvc.perform(post("/api/offer/offer")
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("BOTTLE_001"));
    }
}
