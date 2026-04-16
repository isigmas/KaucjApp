package pl.isigmas.kaucjapp.offers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import pl.isigmas.kaucjapp.offers.repository.OfferRepository;
import pl.isigmas.kaucjapp.offers.repository.BottleTypeRepository;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OfferEndpointTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private BottleTypeRepository bottleTypeRepository;

    @Autowired
    private OfferRepository offerRepository;

    private static Long plasticBottleId;
    private Long canBottleId;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        offerRepository.deleteAll();

        plasticBottleId = bottleTypeRepository.findByName("plastic").orElseThrow().getId();
        canBottleId = bottleTypeRepository.findByName("can").orElseThrow().getId();
    }

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
    void getAllOffersReturnsJson() throws Exception {
        mockMvc.perform(get("/api/offer/szosti"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void getReservedOffersWhenNoneReturnsEmptyArray() throws Exception {
        Long userId = 3333L;

        mockMvc.perform(get("/api/offer/my/reserved")
                        .header("X-User-Id", userId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("[]"));
    }

    @Test
    void changeOfferStatusWithInvalidStatusReturns400() throws Exception {
        Long creatorId = 4444L;
        Long collectorId = 5555L;

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

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", creatorId))
                .andExpect(status().isForbidden());
    }

    @Test
    void deletingNonExistingOfferReturns404() throws Exception {
        mockMvc.perform(delete("/api/offer/999999")
                        .header("X-User-Id", 1L))
                .andExpect(status().isNotFound());
    }

    @Test
    void updatingOfferByNonCreatorReturns403() throws Exception {
        Long creatorId = 7777L;
        Long someoneElseId = 8888L;

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

        String updateOfferJson = """
                {
                "latitude": 52.2497,
                "longitude": 21.0122,
                  "pickupAddress": "ul. Zmieniona 10",
                  "pickupInstructions": "Odbior po 18:00",
                  "items": [
                    { "bottleId": %d, "quantity": 2, "unitPrice": 0.20 }
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
        Long creatorId = 11000L;
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
    void creatingOfferOutsideOfPolandReturns400() throws Exception {
        Long creatorId = 11000L;
        String createOfferJson = """
                    {
                        "latitude": 55.2297,
                        "longitude": 24.0122,
                        "pickupAddress": "ul. Daleko 1",
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
    void updatingOfferWhenStatusIsNotOpenReturns409() throws Exception {
        Long creatorId = 12001L;
        Long collectorId = 12002L;

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

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        String updateOfferJson = """
                {
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "pickupAddress": "ul. Zmieniona 10",
                    "pickupInstructions": "Odbior po 18:00",
                    "items": [
                      { "bottleId": %d, "quantity": 2, "unitPrice": 0.20 }
                    ]
                }
                """.formatted(plasticBottleId);

        mockMvc.perform(patch("/api/offer/" + offerId)
                        .header("X-User-Id", creatorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateOfferJson))
                .andExpect(status().isConflict());
    }

    @Test
    void changingStatusFromOpenDirectlyToCompletedReturns409() throws Exception {
        Long creatorId = 13001L;
        Long collectorId = 13002L;

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

        mockMvc.perform(post("/api/offer/" + offerId + "/status/RESERVED")
                        .header("X-User-Id", collectorId))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/offer/" + offerId + "/status/COMPLETED")
                        .header("X-User-Id", someoneElseId))
                .andExpect(status().isForbidden());
    }


    @ParameterizedTest(name = "PATCH offer: {1}")
    @MethodSource("provideOfferWithoutParameters")
    void updatingOfferWithoutParametersWorks(String updateOfferJsonTemplate, String reason,
                                             int expectedStatus,
                                             Double expectedLat, Double expectedLon, String expectedAddress) throws Exception {

        Long creatorId = 15001L;

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
                    "pickupAddress": "ul. Odbiorcza 2",
                    "pickupInstructions": "Test2",
                    "items": [ { "bottleId": %d, "quantity": 2, "unitPrice": 0.10 } ]
                }
                """, "missing latitude keeps previous latitude", 200, 52.2297, 22.0122, "ul. Odbiorcza 2"),

                Arguments.of("""
                {
                    "latitude": 51.2297,
                    "pickupAddress": "ul. Odbiorcza 2",
                    "pickupInstructions": "Test2",
                    "items": [ { "bottleId": %d, "quantity": 2, "unitPrice": 0.10 } ]
                }
                """, "missing longitude keeps previous longitude", 200, 51.2297, 21.0122, "ul. Odbiorcza 2"),

                Arguments.of("""
                {
                    "longitude": 22.0122,
                    "latitude": 51.2297,
                    "pickupInstructions": "Test2",
                    "items": [ { "bottleId": %d, "quantity": 2, "unitPrice": 0.10 } ]
                }
                """, "missing pickupAddress keeps previous address", 200, 51.2297, 22.0122, "ul. Odbiorcza 1")
        );
    }

}