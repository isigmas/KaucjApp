package pl.isigmas.kaucjapp.auth.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.auth.entity.Account;
import pl.isigmas.kaucjapp.auth.entity.DeletionSchedule;
import pl.isigmas.kaucjapp.auth.entity.RefreshToken;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;
import pl.isigmas.kaucjapp.auth.exception.AccountAlreadyDeleted;
import pl.isigmas.kaucjapp.auth.exception.AccountNotFoundException;
import pl.isigmas.kaucjapp.auth.publisher.AuthKafkaPublisher;
import pl.isigmas.kaucjapp.auth.repository.AccountRepository;
import pl.isigmas.kaucjapp.auth.repository.DeletionScheduleRepository;
import pl.isigmas.kaucjapp.auth.repository.RefreshTokenRepository;
import pl.isigmas.kaucjapp.auth.security.Encoder;
import pl.isigmas.kaucjapp.common.dto.WarningDTO;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceDeleteTest {

    @Mock
    private AccountRepository accountRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private DeletionScheduleRepository deletionScheduleRepository;
    @Mock
    private AuthKafkaPublisher authKafkaPublisher;
    @Mock
    private Encoder encoder;

    @InjectMocks
    private AuthService authService;

    @Captor
    private ArgumentCaptor<DeletionSchedule> deletionScheduleCaptor;
    @Captor
    private ArgumentCaptor<WarningDTO> warningCaptor;

    @Test
    void delete_ShouldSuccessfullyInitiateDeletion_WhenAccountIsActive() {
        Long accountId = 1L;
        Account account = new Account();
        account.setId(accountId);
        account.setEmail("test@test.com");
        account.setUsername("testuser");
        account.setStatus(AccountStatus.ACTIVE);

        RefreshToken token = new RefreshToken();
        token.setRevoked(false);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(refreshTokenRepository.findAllByAccount(account)).thenReturn(List.of(token));
        when(encoder.hashPassword(any())).thenReturn("new-hash");

        authService.delete(accountId);

        assertThat(token.isRevoked()).isTrue();
        assertThat(account.getEmail()).endsWith("@deleted.user");
        assertThat(account.getUsername()).startsWith("deleted#");
        assertThat(account.getStatus()).isEqualTo(AccountStatus.PENDING_DELETION);
        assertThat(account.getPasswordHash()).isEqualTo("new-hash");

        verify(authKafkaPublisher).sendDeleteUser(eq(accountId), anyString());

        verify(deletionScheduleRepository).save(deletionScheduleCaptor.capture());
        DeletionSchedule savedSchedule = deletionScheduleCaptor.getValue();
        assertThat(savedSchedule.getAccount()).isEqualTo(account);
        assertThat(savedSchedule.getBackupEmail()).isEqualTo("test@test.com");
        assertThat(savedSchedule.getBackupUsername()).isEqualTo("testuser");
        assertThat(savedSchedule.getScheduledDeletionDate()).isNotNull();

        verify(authKafkaPublisher, never()).sendWarning(any());
    }

    @Test
    void delete_ShouldThrowException_WhenAccountNotFound() {
        Long accountId = 99L;
        when(accountRepository.findById(accountId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.delete(accountId))
                .isInstanceOf(AccountNotFoundException.class);
    }

    @Test
    void delete_ShouldThrowException_WhenAccountAlreadyDeleted() {
        Long accountId = 1L;
        Account account = new Account();
        account.setId(accountId);
        account.setStatus(AccountStatus.DELETED);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> authService.delete(accountId))
                .isInstanceOf(AccountAlreadyDeleted.class)
                .hasMessageContaining("Account already deleted");
    }

    @Test
    void delete_ShouldSendWarning_WhenAccountIsSuspended() {
        Long accountId = 1L;
        Account account = new Account();
        account.setId(accountId);
        account.setEmail("test@test.com");
        account.setUsername("testuser");
        account.setStatus(AccountStatus.SUSPENDED);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        authService.delete(accountId);

        verify(authKafkaPublisher).sendWarning(warningCaptor.capture());
        WarningDTO savedWarning = warningCaptor.getValue();
        assertThat(savedWarning.message()).contains("Attempt to delete a suspended account");
        
        assertThat(account.getStatus()).isEqualTo(AccountStatus.PENDING_DELETION);
    }
}
