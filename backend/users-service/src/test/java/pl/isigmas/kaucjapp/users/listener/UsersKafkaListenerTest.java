package pl.isigmas.kaucjapp.users.listener;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.service.UserService;
import pl.isigmas.kaucjapp.users.service.UserStatsIngestService;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class UsersKafkaListenerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserStatsIngestService userStatsIngestService;

    @Mock
    private Logger logger;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private UsersKafkaListener listener;

    @BeforeEach
    void setUp() {
        listener = new UsersKafkaListener(userService, userStatsIngestService, logger, objectMapper);
    }

    @Test
    void handleOfferCompleted_validJson_delegatesToIngestService() {
        String eventJson = """
                {"offer_id":1,"creator_id":10,"collector_id":20,"plastic_quantity":3,"can_quantity":2}
                """;

        listener.handleOfferCompleted(eventJson);

        verify(userStatsIngestService).ingestOfferCompleted(argThat(event ->
                event.getOfferId().equals(1L)
                        && event.getCreatorId().equals(10L)
                        && event.getCollectorId().equals(20L)
                        && event.getPlasticQuantity() == 3
                        && event.getCanQuantity() == 2
        ));
    }

    @Test
    void handleOfferCompleted_invalidJson_doesNotPropagateException() {
        assertThatCode(() -> listener.handleOfferCompleted("{ not valid json"))
                .doesNotThrowAnyException();
        verifyNoInteractions(userStatsIngestService);
    }
}
