package pl.isigmas.kaucjapp.deposit.listener;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.deposit.service.RatingService;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DepositKafkaListenerTest {

    @Mock
    private RatingService ratingService;
    @Mock
    private Logger logger;

    @InjectMocks
    private DepositKafkaListener listener;

    @Test
    void handleUserDeleted_parsesIdAndAnonymizesReviews() {
        listener.handleUserDeleted("3");

        verify(ratingService).deleteUserInfo(3L);
    }
}
