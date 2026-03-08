package pl.isigmas.kaucjapp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
class EndpointTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testCreateUser() throws Exception {
        String json = """
                {
                    "name": "Jan",
                    "surname": "Kowalski",
                    "username": "jkowalski%s",
                    "phoneNumber": "123456789",
                    "email": "jan%s@example.com",
                    "defaultAddress": "ul. Testowa 1",
                    "defaultLatitude": 52.2297,
                    "defaultLongitude": 21.0122
                }
                """.formatted(System.currentTimeMillis(), System.currentTimeMillis());

        mockMvc.perform(post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated());
    }

    @Test
    void testGetUserNotFound() throws Exception {
        mockMvc.perform(get("/api/user/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDeleteUserNotFound() throws Exception {
        mockMvc.perform(delete("/api/user/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateOffer() throws Exception {
        String json = """
                {
                    "creatorId": 1,
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
                """;

        mockMvc.perform(post("/api/offer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated());
    }

    @Test
    void testGetAllOffers() throws Exception {
        mockMvc.perform(get("/api/szosti"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
