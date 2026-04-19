package pl.isigmas.kaucjapp.deposit.integration.search;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineRequestDTO;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineStatus;
import pl.isigmas.kaucjapp.deposit.support.BaseIntegrationTest;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class DepositMachineSearchEndpointTest extends BaseIntegrationTest {

    @Test
    void machinesSearchInAreaWorks() throws Exception {
        DepositMachineRequestDTO krakow = DepositMachineRequestDTO.builder()
                .networkName("Zabka")
                .status(DepositMachineStatus.AVAILABLE)
                .address("ul. Wawelska 15, 31-000 Kraków")
                .latitude(new BigDecimal("50.052000"))
                .longitude(new BigDecimal("19.936000"))
                .openingHours(openingHoursFullWeek())
                .build();

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(krakow)))
                .andExpect(status().isCreated());

        DepositMachineRequestDTO gdansk = DepositMachineRequestDTO.builder()
                .networkName("Biedronka")
                .status(DepositMachineStatus.AVAILABLE)
                .address("ul. Wawelska 15, 31-000 Kraków")
                .latitude(new BigDecimal("54.352000"))
                .longitude(new BigDecimal("18.646000"))
                .openingHours(openingHoursFullWeek())
                .build();

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(gdansk)))
                .andExpect(status().isCreated());

        Long zabkaId = depositMachineRepository.findAll().stream()
                .filter(m -> m.getRetailNetwork().getName().equals("Zabka"))
                .findFirst()
                .orElseThrow()
                .getId();
        Long biedronkaId = depositMachineRepository.findAll().stream()
                .filter(m -> m.getRetailNetwork().getName().equals("Biedronka"))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(get("/api/deposit/search")
                        .param("swLat", "50.000000")
                        .param("swLon", "19.000000")
                        .param("neLat", "51.000000")
                        .param("neLon", "20.000000"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(zabkaId))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].networkName").value("Zabka"))
                .andExpect(jsonPath("$[0].latitude").value(50.052000))
                .andExpect(jsonPath("$[0].longitude").value(19.936000));

        mockMvc.perform(get("/api/deposit/search")
                        .param("swLat", "54.000000")
                        .param("swLon", "18.000000")
                        .param("neLat", "55.000000")
                        .param("neLon", "19.000000"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(biedronkaId))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].networkName").value("Biedronka"))
                .andExpect(jsonPath("$[0].latitude").value(54.352000))
                .andExpect(jsonPath("$[0].longitude").value(18.646000));
    }
}
