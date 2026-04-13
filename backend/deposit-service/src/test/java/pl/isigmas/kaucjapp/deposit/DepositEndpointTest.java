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
    void offerCrudAndStatusFlowWorks() throws Exception {
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
    }

}