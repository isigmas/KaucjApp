package pl.isigmas.kaucjapp.deposit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineStatus;
import pl.isigmas.kaucjapp.deposit.repository.DepositMachineRepository;
import pl.isigmas.kaucjapp.deposit.repository.RetailNetworkRepository;


import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DepositEndpointTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private DepositMachineRepository depositMachineRepository;

    @Autowired
    private RetailNetworkRepository retailNetworkRepository;


    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        depositMachineRepository.deleteAll();
    }

    @Test
    void depositCrudAndStatusFlowWorks() throws Exception {
        String createDepositMachineJSON = """
                {
                   "networkName": "Zabka",
                   "status": "AVAILABLE",
                   "address": "ul. Wawelska 15, 31-000 Kraków",
                   "latitude": 50.052000,
                   "longitude": 19.936000,
                   "openingHours": [
                     {
                       "dayOfWeek": 1,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 2,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 3,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 4,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 5,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 6,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 7,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     }
                   ]
                 }
                """;

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createDepositMachineJSON))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/deposit/machines"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].networkName").value("Zabka"))
                .andExpect(jsonPath("$[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$[0].address").value("ul. Wawelska 15, 31-000 Kraków"))
                .andExpect(jsonPath("$[0].latitude").value(50.052000))
                .andExpect(jsonPath("$[0].longitude").value(19.936000))
                .andExpect(jsonPath("$[0].openingHours.length()").value(7));

        String updateDepositJSON = """
                {
                "status": "OUT_OF_ORDER",
                "networkName": "Biedronka"
                }
                """;

        Long id = depositMachineRepository.findAll().getFirst().getId();

        mockMvc.perform(put("/api/deposit/machine/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateDepositJSON))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/deposit/machines"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].networkName").value("Biedronka"))
                .andExpect(jsonPath("$[0].status").value("OUT_OF_ORDER"))
                .andExpect(jsonPath("$[0].address").value("ul. Wawelska 15, 31-000 Kraków"))
                .andExpect(jsonPath("$[0].latitude").value(50.052000))
                .andExpect(jsonPath("$[0].longitude").value(19.936000))
                .andExpect(jsonPath("$[0].openingHours.length()").value(7));

        mockMvc.perform(delete("/api/deposit/machine/"+id))
                .andExpect(status().isOk());

        assertThat(depositMachineRepository.findAll().isEmpty());
    }


    @Test
    void updatingSpecificDaysWorks() throws Exception {
        String createDepositMachineJSON = """
                {
                   "networkName": "Zabka",
                   "status": "AVAILABLE",
                   "address": "ul. Wawelska 15, 31-000 Kraków",
                   "latitude": 50.052000,
                   "longitude": 19.936000,
                   "openingHours": [
                     {
                       "dayOfWeek": 1,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 2,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 3,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 4,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 5,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 6,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 7,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     }
                   ]
                 }
                """;

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createDepositMachineJSON))
                .andExpect(status().isCreated());

        Long id = depositMachineRepository.findAll().getFirst().getId();


        String updateMachineHoursJSON = """
                {
                    "openingHours": [
                     {
                       "dayOfWeek": 1,
                       "openTime": "07:00:00",
                       "closeTime": "21:00:00"
                     }
                   ]
                }
                """;

        mockMvc.perform(put("/api/deposit/machine/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateMachineHoursJSON))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/deposit/machines"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].openingHours[0].dayOfWeek").value(1))
                .andExpect(jsonPath("$[0].openingHours[0].openTime").value("07:00:00"))
                .andExpect(jsonPath("$[0].openingHours[0].closeTime").value("21:00:00"))
                .andExpect(jsonPath("$[0].openingHours[1].openTime").value("06:00:00"))
                .andExpect(jsonPath("$[0].openingHours[1].closeTime").value("23:00:00"))
                .andExpect(jsonPath("$[0].openingHours.length()").value(7));


    }


    @Test
    void machinesSearchInAreaWorks() throws Exception {
        String createDepositMachineJSON_1 = """
                {
                   "networkName": "Zabka",
                   "status": "AVAILABLE",
                   "address": "ul. Wawelska 15, 31-000 Kraków",
                   "latitude": 50.052000,
                   "longitude": 19.936000,
                   "openingHours": [
                     {
                       "dayOfWeek": 1,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 2,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 3,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 4,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 5,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 6,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 7,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     }
                   ]
                 }
                """;

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createDepositMachineJSON_1))
                .andExpect(status().isCreated());

        String createDepositMachineJSON_2 = """
                {
                   "networkName": "Biedronka",
                   "status": "AVAILABLE",
                   "address": "ul. Wawelska 15, 31-000 Kraków",
                   "latitude": 54.352000,
                   "longitude": 18.646000,
                   "openingHours": [
                     {
                       "dayOfWeek": 1,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 2,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 3,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 4,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 5,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 6,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     },
                     {
                       "dayOfWeek": 7,
                       "openTime": "06:00:00",
                       "closeTime": "23:00:00"
                     }
                   ]
                 }
                """;

        mockMvc.perform(post("/api/deposit/machine")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createDepositMachineJSON_2))
                .andExpect(status().isCreated());


        String swLat = "50.000000";
        String swLon = "19.000000";
        String neLat = "51.000000";
        String neLon = "20.000000";

        mockMvc.perform(get("/api/deposit/search")
                        .param("swLat", swLat)
                        .param("swLon", swLon)
                        .param("neLat", neLat)
                        .param("neLon", neLon))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].networkName").value("Zabka"))
                .andExpect(jsonPath("$[0].latitude").value(50.052000))
                .andExpect(jsonPath("$[0].longitude").value(19.936000));
        swLat = "54.000000";
        swLon = "18.000000";
        neLat = "55.000000";
        neLon = "19.000000";
        mockMvc.perform(get("/api/deposit/search")
                        .param("swLat", swLat)
                        .param("swLon", swLon)
                        .param("neLat", neLat)
                        .param("neLon", neLon))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].networkName").value("Biedronka"))
                .andExpect(jsonPath("$[0].latitude").value(54.352000))
                .andExpect(jsonPath("$[0].longitude").value(18.646000));

    }
}