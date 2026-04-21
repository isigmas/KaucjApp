package pl.isigmas.kaucjapp.auth.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.auth.entity.Account;
import pl.isigmas.kaucjapp.auth.entity.DeletionSchedule;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;
import pl.isigmas.kaucjapp.auth.repository.DeletionScheduleRepository;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountCleanupServiceTest {

    @Mock
    private DeletionScheduleRepository deletionScheduleRepository;

    @InjectMocks
    private AccountCleanupService accountCleanupService;

    @Test
    void cleanup_ShouldUpdateStatusAndDeleteSchedules_WhenExpiredSchedulesExist() {
        // Given
        Account account1 = new Account();
        account1.setStatus(AccountStatus.PENDING_DELETION);
        
        Account account2 = new Account();
        account2.setStatus(AccountStatus.PENDING_DELETION);

        DeletionSchedule schedule1 = DeletionSchedule.builder().account(account1).build();
        DeletionSchedule schedule2 = DeletionSchedule.builder().account(account2).build();

        List<DeletionSchedule> expiredSchedules = List.of(schedule1, schedule2);

        when(deletionScheduleRepository.findAllByScheduledDeletionDateBefore(any(Instant.class)))
                .thenReturn(expiredSchedules);

        // When
        accountCleanupService.cleanup();

        // Then
        assertThat(account1.getStatus()).isEqualTo(AccountStatus.DELETED);
        assertThat(account2.getStatus()).isEqualTo(AccountStatus.DELETED);

        // Verify that deleteAll was called rather than deleteAllInBatch
        verify(deletionScheduleRepository).deleteAll(expiredSchedules);
    }

    @Test
    void cleanup_ShouldDoNothing_WhenNoExpiredSchedules() {
        // Given
        when(deletionScheduleRepository.findAllByScheduledDeletionDateBefore(any(Instant.class)))
                .thenReturn(Collections.emptyList());

        // When
        accountCleanupService.cleanup();

        // Then
        verify(deletionScheduleRepository, never()).deleteAll(any());
        verify(deletionScheduleRepository, never()).deleteAllInBatch(any());
    }
}
