package pl.isigmas.kaucjapp.offers.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import pl.isigmas.kaucjapp.offers.DTO.OfferCompletedEventDTO;
import pl.isigmas.kaucjapp.offers.repository.BottleTypeRepository;
import pl.isigmas.kaucjapp.offers.repository.OfferRepository;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @MockitoBean
    private KafkaTemplate<String, OfferCompletedEventDTO> kafkaTemplate;

    protected MockMvc mockMvc;

    @Autowired
    protected WebApplicationContext webApplicationContext;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected OfferRepository offerRepository;

    @Autowired
    protected BottleTypeRepository bottleTypeRepository;

    protected Long plasticBottleId;
    protected Long canBottleId;

    @BeforeEach
    void setUpBase() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        offerRepository.deleteAll();
        plasticBottleId = bottleTypeRepository.findByName("plastic").orElseThrow().getId();
        canBottleId = bottleTypeRepository.findByName("can").orElseThrow().getId();
    }
}
