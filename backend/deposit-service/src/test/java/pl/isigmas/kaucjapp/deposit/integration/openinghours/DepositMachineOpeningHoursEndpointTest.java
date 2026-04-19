package pl.isigmas.kaucjapp.deposit.integration.openinghours;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineRequestDTO;
import pl.isigmas.kaucjapp.deposit.DTO.OpeningHourDTO;
import pl.isigmas.kaucjapp.deposit.DTO.UpdateMachineDTO;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineStatus;
import pl.isigmas.kaucjapp.deposit.support.BaseIntegrationTest;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class DepositMachineOpeningHoursEndpointTest extends BaseIntegrationTest {

    @Test
    void updatingSpecificDaysWorks() throws Exception {
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

        UpdateMachineDTO patchHours = UpdateMachineDTO.builder()
                .openingHours(List.of(
                        OpeningHourDTO.builder()
                                .dayOfWeek(1)
                                .openTime(LocalTime.of(7, 0))
                                .closeTime(LocalTime.of(21, 0))
                                .isClosed(false)
                                .build()
                ))
                .build();

        mockMvc.perform(patch("/api/deposit/machine/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patchHours)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/deposit/machines"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].openingHours[0].dayOfWeek").value(1))
                .andExpect(jsonPath("$[0].openingHours[0].isClosed").value(false))
                .andExpect(jsonPath("$[0].openingHours[0].openTime").value("07:00:00"))
                .andExpect(jsonPath("$[0].openingHours[0].closeTime").value("21:00:00"))
                .andExpect(jsonPath("$[0].openingHours[1].isClosed").value(false))
                .andExpect(jsonPath("$[0].openingHours[1].openTime").value("06:00:00"))
                .andExpect(jsonPath("$[0].openingHours[1].closeTime").value("23:00:00"))
                .andExpect(jsonPath("$[0].openingHours.length()").value(7));
    }
}
