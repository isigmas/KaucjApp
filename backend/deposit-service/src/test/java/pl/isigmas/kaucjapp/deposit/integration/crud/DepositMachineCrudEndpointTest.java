package pl.isigmas.kaucjapp.deposit.integration.crud;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineRequestDTO;
import pl.isigmas.kaucjapp.deposit.DTO.UpdateMachineDTO;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineStatus;
import pl.isigmas.kaucjapp.deposit.support.BaseIntegrationTest;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class DepositMachineCrudEndpointTest extends BaseIntegrationTest {

    @Test
    void depositCrudAndStatusFlowWorks() throws Exception {
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

        mockMvc.perform(get("/api/deposit/machines"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].networkName").value("Zabka"))
                .andExpect(jsonPath("$[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$[0].address").value("ul. Wawelska 15, 31-000 Kraków"))
                .andExpect(jsonPath("$[0].latitude").value(50.052000))
                .andExpect(jsonPath("$[0].longitude").value(19.936000))
                .andExpect(jsonPath("$[0].openingHours[0].isClosed").value(false))
                .andExpect(jsonPath("$[0].openingHours.length()").value(7));

        UpdateMachineDTO update = UpdateMachineDTO.builder()
                .status(DepositMachineStatus.OUT_OF_ORDER)
                .networkName("Biedronka")
                .build();

        Long id = depositMachineRepository.findAll().getFirst().getId();

        mockMvc.perform(patch("/api/deposit/machine/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/deposit/machines"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].networkName").value("Biedronka"))
                .andExpect(jsonPath("$[0].status").value("OUT_OF_ORDER"))
                .andExpect(jsonPath("$[0].address").value("ul. Wawelska 15, 31-000 Kraków"))
                .andExpect(jsonPath("$[0].latitude").value(50.052000))
                .andExpect(jsonPath("$[0].longitude").value(19.936000))
                .andExpect(jsonPath("$[0].openingHours[0].isClosed").value(false))
                .andExpect(jsonPath("$[0].openingHours.length()").value(7));

        mockMvc.perform(delete("/api/deposit/machine/" + id))
                .andExpect(status().isOk());

        assertThat(depositMachineRepository.findAll()).isEmpty();
    }
}
