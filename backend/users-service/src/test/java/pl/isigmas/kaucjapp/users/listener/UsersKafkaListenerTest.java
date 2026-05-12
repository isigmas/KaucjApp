package pl.isigmas.kaucjapp.users.listener;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.users.repository.UserStatsRepository;
import pl.isigmas.kaucjapp.users.service.UserService;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class UsersKafkaListenerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserStatsRepository userStatsRepository;

    private UsersKafkaListener listener;

    @BeforeEach
    void setUp() {
        listener = new UsersKafkaListener(userService, userStatsRepository);
    }

    @Test
    void handleOfferCompleted_validJson_parsesAndIncrementsStatsWithExpectedArguments() {
        // Given
        String eventJson = """
                {"offerId":1,"creatorId":10,"collectorId":20,"plasticQuantity":3,"canQuantity":2}
                """;

        // When
        listener.handleOfferCompleted(eventJson);

        // Then
        verify(userStatsRepository).incrementReturnedStats(10L, 3, 2);
        verify(userStatsRepository).incrementCollectedStats(20L, 3, 2);
    }

    @Test
    void handleOfferCompleted_invalidJson_doesNotPropagateException_andDoesNotTouchRepository() {
        // Given
        String corrupted = "{ not valid json";

        // When / Then — listener swallows parse errors so the consumer thread does not fail the poll loop
        assertThatCode(() -> listener.handleOfferCompleted(corrupted)).doesNotThrowAnyException();
        verifyNoInteractions(userStatsRepository);
    }
}
