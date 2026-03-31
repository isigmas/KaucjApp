package pl.isigmas.kaucjapp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import pl.isigmas.kaucjapp.model.Offer;
import pl.isigmas.kaucjapp.model.User;
import pl.isigmas.kaucjapp.repository.OfferRepository;
import pl.isigmas.kaucjapp.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OfferEndpointTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OfferRepository offerRepository;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void offerCrudAndStatusFlowWorks() throws Exception {
        Long creatorId = createUser("offer_creator", "offer_creator@example.com");
        Long collectorId = createUser("offer_collector", "offer_collector@example.com");

        String createOfferJson = """
                {
                    "creatorId": %d,
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "aQuantity": 10,
                    "aPrice": 10.0,
                    "aFee": 5.0,
                    "bQuantity": 10,
                    "bPrice": 10.0,
                    "bFee": 5.0,
                    "cQuantity": 10,
                    "cPrice": 10.0,
                    "cFee": 5.0,
                    "pickupAddress": "ul. Odbiorcza 1",
                    "pickupInstructions": "Zadzwonic po przybyciu"
                }
                """.formatted(creatorId);

        mockMvc.perform(post("/api/offer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isCreated());

        Offer offer = offerRepository.findAll().stream().findFirst().orElseThrow();
        Long offerId = offer.getId();

        mockMvc.perform(get("/api/szosti"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].offer_id").value(offerId))
                .andExpect(jsonPath("$[0].user.user_id").value(creatorId));

        String updateOfferJson = """
                {
                    "pickupAddress": "ul. Zmieniona 10",
                    "pickupInstructions": "Odbior po 18:00",
                    "aQuantity": 8,
                    "aPrice": 8.5,
                    "aFee": 2.0
                }
                """;

        mockMvc.perform(put("/api/offer/" + offerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateOfferJson))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/szosti/" + creatorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].offer_id").value(offerId));

        mockMvc.perform(post("/api/change-offer-status/" + offerId + "/" + collectorId + "/RESERVED"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/szosti/reserved/" + collectorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].offer_id").value(offerId));

        mockMvc.perform(delete("/api/offer/" + offerId))
                .andExpect(status().isOk());

        assertThat(offerRepository.findById(offerId)).isEmpty();
    }

    @Test
    void getAllOffersReturnsJson() throws Exception {
        mockMvc.perform(get("/api/szosti"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void getReservedOffersWhenNoneReturnsEmptyArray() throws Exception {
        Long userId = createUser("reserved_empty", "reserved_empty@example.com");

        mockMvc.perform(get("/api/szosti/reserved/" + userId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("[]"));
    }

    @Test
    void changeOfferStatusWithInvalidStatusReturns400() throws Exception {
        Long creatorId = createUser("creator_invalid_status", "creator_invalid_status@example.com");
        Long collectorId = createUser("collector_invalid_status", "collector_invalid_status@example.com");

        String createOfferJson = """
                {
                    "creatorId": %d,
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "aQuantity": 1,
                    "aPrice": 10.0,
                    "aFee": 1.0,
                    "bQuantity": 1,
                    "bPrice": 10.0,
                    "bFee": 1.0,
                    "cQuantity": 1,
                    "cPrice": 10.0,
                    "cFee": 1.0,
                    "pickupAddress": "ul. Odbiorcza 1",
                    "pickupInstructions": "Test"
                }
                """.formatted(creatorId);

        mockMvc.perform(post("/api/offer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isCreated());

        Long offerId = offerRepository.findAll().stream()
        .filter(o -> o.getCreator().getId().equals(creatorId))
        .findFirst()
        .orElseThrow()
        .getId();

        mockMvc.perform(post("/api/change-offer-status/" + offerId + "/" + collectorId + "/NOT_A_STATUS"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reserveOfferWithNonExistentUserReturns500() throws Exception {
        Long creatorId = createUser("creator_missing_user", "creator_missing_user@example.com");

        String createOfferJson = """
                {
                    "creatorId": %d,
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "aQuantity": 1,
                    "aPrice": 10.0,
                    "aFee": 1.0,
                    "bQuantity": 1,
                    "bPrice": 10.0,
                    "bFee": 1.0,
                    "cQuantity": 1,
                    "cPrice": 10.0,
                    "cFee": 1.0,
                    "pickupAddress": "ul. Odbiorcza 1",
                    "pickupInstructions": "Test"
                }
                """.formatted(creatorId);

        mockMvc.perform(post("/api/offer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isCreated());

        Long offerId = offerRepository.findAll().stream().findFirst().orElseThrow().getId();

        mockMvc.perform(post("/api/change-offer-status/" + offerId + "/999999/RESERVED"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void cannotReserveYourOwnOffer() throws Exception {
        Long creatorId = createUser("creator_own_offer", "creator_own_offer@example.com");
        Long collectorId = createUser("collector_own_offer", "collector_own_offer@example.com");

        String createOfferJson = """
                {
                    "creatorId": %d,
                    "latitude": 52.2297,
                    "longitude": 21.0122,
                    "aQuantity": 1,
                    "aPrice": 10.0,
                    "aFee": 1.0,
                    "bQuantity": 1,
                    "bPrice": 10.0,
                    "bFee": 1.0,
                    "cQuantity": 1,
                    "cPrice": 10.0,
                    "cFee": 1.0,
                    "pickupAddress": "ul. Odbiorcza 1",
                    "pickupInstructions": "Test"
                }
                """.formatted(creatorId);

        mockMvc.perform(post("/api/offer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isCreated());

        Long offerId = offerRepository.findAll().stream()
        .filter(o -> o.getCreator().getId().equals(creatorId))
        .findFirst()
        .orElseThrow()
        .getId();

        mockMvc.perform(post("/api/change-offer-status/" + offerId + "/" + creatorId + "/RESERVED"))
                .andExpect(status().isBadRequest());

        assertThat(offerRepository.findById(offerId).orElseThrow().getCollector()).isNull();
    }


    @ParameterizedTest(name = "Should return 400 when: {1}")
    @MethodSource("provideInvalidOfferPayloads")
    void creatingOfferWithInvalidDataReturns400(String invalidJson, String failureReason) throws Exception {
        mockMvc.perform(post("/api/offer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    private static Stream<Arguments> provideInvalidOfferPayloads() {
        return Stream.of(
            Arguments.of(createJson("-1", "10.0", "1.0"), "Negative aQuantity"),
            Arguments.of(createJson("10", "-1.0", "1.0"), "Negative aPrice"),
            Arguments.of(createJson("10", "10.0", "-1.0"), "Negative aFee"),

            Arguments.of(createJsonB("-1", "10.0", "1.0"), "Negative bQuantity"),
            Arguments.of(createJsonB("10", "-1.0", "1.0"), "Negative bPrice"),
            Arguments.of(createJsonB("10", "10.0", "-1.0"), "Negative bFee"),

            Arguments.of(createJsonC("-1", "10.0", "1.0"), "Negative cQuantity"),
            Arguments.of(createJsonC("10", "-1.0", "1.0"), "Negative cPrice"),
            Arguments.of(createJsonC("10", "10.0", "-1.0"), "Negative cFee")
        );
    }

    private static String createJson(String q, String p, String f) {
        return """
            {"creatorId":1, "aQuantity":%s, "aPrice":%s, "aFee":%s, "pickupAddress":"Test"}
            """.formatted(q, p, f);
    }
    private static String createJsonB(String q, String p, String f) {
        return """
            {"creatorId":1, "bQuantity":%s, "bPrice":%s, "bFee":%s, "pickupAddress":"Test"}
            """.formatted(q, p, f);
    }
    private static String createJsonC(String q, String p, String f) {
        return """
            {"creatorId":1, "cQuantity":%s, "cPrice":%s, "cFee":%s, "pickupAddress":"Test"}
            """.formatted(q, p, f);
    }
 


    private Long createUser(String username, String email) throws Exception {
        String createUserJson = """
                {
                    "name": "Test",
                    "surname": "User",
                    "username": "%s",
                    "phone_number": "555444333",
                    "email": "%s",
                    "default_address": "ul. Testowa 100",
                    "default_latitude": 50.01,
                    "default_longitude": 19.99
                }
                """.formatted(username, email);

        mockMvc.perform(post("/api/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createUserJson))
                .andExpect(status().isCreated());

        User user = userRepository.findAll().stream()
                .filter(it -> username.equals(it.getUsername()))
                .findFirst()
                .orElseThrow();
        return user.getId();
    }



}
