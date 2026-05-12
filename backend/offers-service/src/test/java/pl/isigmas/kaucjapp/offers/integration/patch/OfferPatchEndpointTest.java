package pl.isigmas.kaucjapp.offers.integration.patch;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.offers.support.BaseIntegrationTest;

import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class OfferPatchEndpointTest extends BaseIntegrationTest {

    @Test
    void updatingOfferByNonCreatorReturns403() throws Exception {
        Long creatorId = 7777L;
        Long someoneElseId = 8888L;

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

        String updateOfferJson = """
                {
                "latitude": 52.2497,
                "longitude": 21.0122,
                  "pickup_address": "ul. Zmieniona 10",
                  "pickup_instructions": "Odbior po 18:00",
                  "items": [
                    { "bottle_id": %d, "quantity": 2, "unit_price": 0.20 }
                  ]
                }
                """.formatted(plasticBottleId);

        mockMvc.perform(patch("/api/offer/" + offerId)
                        .header("X-User-Id", someoneElseId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateOfferJson))
                .andExpect(status().isForbidden());
    }

    @Test
    void updatingOfferWhenStatusIsNotOpenReturns409() throws Exception {
        Long creatorId = 12001L;
        Long collectorId = 12002L;

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

        String updateOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "pickup_address": "ul. Zmieniona 10",
                    "pickup_instructions": "Odbior po 18:00",
                    "items": [
                      { "bottle_id": %d, "quantity": 2, "unit_price": 0.20 }
                    ]
                }
                """.formatted(plasticBottleId);

        mockMvc.perform(patch("/api/offer/" + offerId)
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateOfferJson))
                .andExpect(status().isConflict());
    }

    @ParameterizedTest(name = "PATCH offer: {1}")
    @MethodSource("provideOfferWithoutParameters")
    void updatingOfferWithoutParametersWorks(String updateOfferJsonTemplate, String reason,
                                             int expectedStatus,
                                             Double expectedLat, Double expectedLon, String expectedAddress) throws Exception {

        Long creatorId = 16001L;

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

        String finalUpdateJson = updateOfferJsonTemplate.formatted(plasticBottleId);

        mockMvc.perform(patch("/api/offer/{id}", offerId)
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(finalUpdateJson))
                .andExpect(status().is(expectedStatus));

        mockMvc.perform(get("/api/offer/my")
                        .header("X-User-Id", creatorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].latitude").value(expectedLat))
                .andExpect(jsonPath("$[0].longitude").value(expectedLon))
                .andExpect(jsonPath("$[0].pickup_address").value(expectedAddress));
    }

    private static Stream<Arguments> provideOfferWithoutParameters() {

        return Stream.of(
                Arguments.of("""
                {
                    "longitude": 22.0122,
                    "pickup_address": "ul. Odbiorcza 2",
                    "pickup_instructions": "Test2",
                    "items": [ { "bottle_id": %d, "quantity": 2, "unit_price": 0.10 } ]
                }
                """, "missing latitude keeps previous latitude", 200, 52.2297, 22.0122, "ul. Odbiorcza 2"),

                Arguments.of("""
                {
                    "latitude": 51.2297,
                    "pickup_address": "ul. Odbiorcza 2",
                    "pickup_instructions": "Test2",
                    "items": [ { "bottle_id": %d, "quantity": 2, "unit_price": 0.10 } ]
                }
                """, "missing longitude keeps previous longitude", 200, 51.2297, 21.0122, "ul. Odbiorcza 2"),

                Arguments.of("""
                {
                    "longitude": 22.0122,
                    "latitude": 51.2297,
                    "pickup_instructions": "Test2",
                    "items": [ { "bottle_id": %d, "quantity": 2, "unit_price": 0.10 } ]
                }
                """, "missing pickupAddress keeps previous address", 200, 51.2297, 22.0122, "ul. Odbiorcza 1")
        );
    }
}
