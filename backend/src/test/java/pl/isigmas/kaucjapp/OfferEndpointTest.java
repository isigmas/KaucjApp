package pl.isigmas.kaucjapp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
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
                    "pickupAddress": "ul. Odbiorcza 1",
                    "pickupInstructions": "Test"
                }
                """.formatted(creatorId);

        mockMvc.perform(post("/api/offer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOfferJson))
                .andExpect(status().isCreated());

        Long offerId = offerRepository.findAll().stream().findFirst().orElseThrow().getId();

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

    private Long createUser(String username, String email) throws Exception {
        String createUserJson = """
                {
                    "name": "Test",
                    "surname": "User",
                    "username": "%s",
                    "phoneNumber": "555444333",
                    "email": "%s",
                    "defaultAddress": "ul. Testowa 100",
                    "defaultLatitude": 50.01,
                    "defaultLongitude": 19.99
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
