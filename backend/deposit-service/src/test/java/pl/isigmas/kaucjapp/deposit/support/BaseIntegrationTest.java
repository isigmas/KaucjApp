package pl.isigmas.kaucjapp.deposit.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import pl.isigmas.kaucjapp.deposit.DTO.OpeningHourDTO;
import pl.isigmas.kaucjapp.deposit.repository.DepositMachineRepository;
import pl.isigmas.kaucjapp.deposit.repository.RetailNetworkRepository;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @MockitoBean
    private KafkaTemplate<String, String> kafkaTemplate;

    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    private WebApplicationContext webApplicationContext;


    @Autowired
    protected DepositMachineRepository depositMachineRepository;

    @Autowired
    protected RetailNetworkRepository retailNetworkRepository;

    @BeforeEach
    void setUpBase() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @BeforeEach
    void cleanDepositMachines() {

        depositMachineRepository.deleteAll();
    }

    protected List<OpeningHourDTO> openingHoursFullWeek() {
        List<OpeningHourDTO> hours = new ArrayList<>();
        for (int day = 1; day <= 7; day++) {
            hours.add(OpeningHourDTO.builder()
                    .dayOfWeek(day)
                    .openTime(LocalTime.of(6, 0))
                    .closeTime(LocalTime.of(23, 0))
                    .isClosed(false)
                    .build());
        }
        return hours;
    }
}
