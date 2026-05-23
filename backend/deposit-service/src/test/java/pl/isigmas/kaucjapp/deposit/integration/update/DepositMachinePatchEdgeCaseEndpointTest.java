package pl.isigmas.kaucjapp.deposit.integration.update;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineRequestDTO;
import pl.isigmas.kaucjapp.deposit.DTO.UpdateMachineDTO;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineStatus;
import pl.isigmas.kaucjapp.deposit.support.BaseIntegrationTest;

import java.math.BigDecimal;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Sad-path and partial-update behaviour for PATCH /api/deposit/machine/{id}.
 */
public class DepositMachinePatchEdgeCaseEndpointTest extends BaseIntegrationTest {

    @Test
    void patchWithUnknownNetworkNameReturns404() throws Exception {
        DepositMachineRequestDTO create = DepositMachineRequestDTO.builder()
                .networkName("Zabka")
                .status(DepositMachineStatus.AVAILABLE)
                .address("ul. Wawelska 15, 31-000 Kraków")
                .latitude(new BigDecimal("50.052000"))
                .longitude(new BigDecimal("19.936000"))
                .openingHours(openingHoursFullWeek())
                .build();

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isCreated());

        Long id = depositMachineRepository.findAll().getFirst().getId();

        UpdateMachineDTO patch = UpdateMachineDTO.builder()
                .networkName("SiecKtorejNigdyNieBylo")
                .build();

        mockMvc.perform(patch("/api/deposit/machine/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patch)))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error_code").value("DEP_002"));
    }

    @Test
    void patchOnlyStatusPreservesAddressAndOpeningHours() throws Exception {
        DepositMachineRequestDTO create = DepositMachineRequestDTO.builder()
                .networkName("Lidl")
                .status(DepositMachineStatus.AVAILABLE)
                .address("ul. Zachowana 42, 00-001 Warszawa")
                .latitude(new BigDecimal("52.229700"))
                .longitude(new BigDecimal("21.012200"))
                .openingHours(openingHoursFullWeek())
                .build();

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isCreated());

        Long id = depositMachineRepository.findAll().getFirst().getId();

        UpdateMachineDTO statusOnly = UpdateMachineDTO.builder()
                .status(DepositMachineStatus.FULL)
                .build();

        mockMvc.perform(patch("/api/deposit/machine/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusOnly)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/deposit/machines"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("FULL"))
                .andExpect(jsonPath("$[0].address").value("ul. Zachowana 42, 00-001 Warszawa"))
                .andExpect(jsonPath("$[0].latitude").value(52.229700))
                .andExpect(jsonPath("$[0].longitude").value(21.012200))
                .andExpect(jsonPath("$[0].network_name").value("Lidl"))
                .andExpect(jsonPath("$[0].opening_hours.length()").value(7))
                .andExpect(jsonPath("$[0].opening_hours[0].open_time").value("06:00:00"));
    }

    @Test
    void patchWithBlankNetworkNameReturns400() throws Exception {
        DepositMachineRequestDTO create = DepositMachineRequestDTO.builder()
                .networkName("Dino")
                .status(DepositMachineStatus.AVAILABLE)
                .address("ul. Test 1")
                .latitude(new BigDecimal("50.052000"))
                .longitude(new BigDecimal("19.936000"))
                .openingHours(openingHoursFullWeek())
                .build();

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isCreated());

        Long id = depositMachineRepository.findAll().getFirst().getId();

        Map<String, String> body = Map.of("network_name", "   ");
        mockMvc.perform(patch("/api/deposit/machine/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("DEP_003"));
    }
}
