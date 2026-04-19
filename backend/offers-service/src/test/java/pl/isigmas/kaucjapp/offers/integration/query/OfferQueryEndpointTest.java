package pl.isigmas.kaucjapp.offers.integration.query;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.offers.support.BaseIntegrationTest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class OfferQueryEndpointTest extends BaseIntegrationTest {

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
}
