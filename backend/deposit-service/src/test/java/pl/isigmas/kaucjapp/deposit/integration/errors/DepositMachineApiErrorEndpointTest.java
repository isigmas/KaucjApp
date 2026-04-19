package pl.isigmas.kaucjapp.deposit.integration.errors;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.deposit.support.BaseIntegrationTest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class DepositMachineApiErrorEndpointTest extends BaseIntegrationTest {

    @Test
    void shouldReturn404WhenMachineDoesNotExist() throws Exception {
        long missingId = 999_999L;

        mockMvc.perform(delete("/api/deposit/machine/" + missingId))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.errorCode").value("DEP_001"))
                .andExpect(jsonPath("$.path").value("/api/deposit/machine/" + missingId));
    }

    @Test
    void shouldReturn400WithValidationErrorsWhenCreatingMachineWithInvalidPayload() throws Exception {
        String invalidJson = """
                {
                  "status": "AVAILABLE",
                  "address": "ul. Testowa 1, 00-000 Warszawa",
                  "latitude": 999.00,
                  "longitude": 19.936000,
                  "openingHours": [
                    { "dayOfWeek": 1, "openTime": "06:00:00", "closeTime": "23:00:00" }
                  ]
                }
                """;

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERR"))
                .andExpect(jsonPath("$.validationErrors").exists())
                .andExpect(jsonPath("$.validationErrors.networkName").exists())
                .andExpect(jsonPath("$.validationErrors.latitude").exists());
    }

    @Test
    void shouldReturn404WhenRetailNetworkDoesNotExist() throws Exception {
        String jsonWithUnknownNetwork = """
                {
                  "networkName": "TescoWielkie",
                  "status": "AVAILABLE",
                  "address": "ul. Testowa 1, 00-000 Warszawa",
                  "latitude": 52.2297,
                  "longitude": 21.0122,
                  "openingHours": [
                    { "dayOfWeek": 1, "openTime": "06:00:00", "closeTime": "23:00:00" }
                  ]
                }
                """;

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonWithUnknownNetwork))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.errorCode").value("DEP_002"))
                .andExpect(jsonPath("$.path").value("/api/deposit/machine"));
    }

    @Test
    void shouldReturn400WhenSearchParamsAreMissing() throws Exception {
        mockMvc.perform(get("/api/deposit/search")
                        .param("swLon", "19.000000")
                        .param("neLat", "51.000000")
                        .param("neLon", "20.000000"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.errorCode").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.path").value("/api/deposit/search"));
    }
}
