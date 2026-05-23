package pl.isigmas.kaucjapp.auth.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.auth.entity.Account;
import pl.isigmas.kaucjapp.auth.entity.DeletionSchedule;
import pl.isigmas.kaucjapp.auth.entity.RefreshToken;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;
import pl.isigmas.kaucjapp.auth.publisher.AuthKafkaPublisher;
import pl.isigmas.kaucjapp.auth.repository.AccountRepository;
import pl.isigmas.kaucjapp.auth.repository.ActivationTokenRepository;
import pl.isigmas.kaucjapp.auth.repository.DeletionScheduleRepository;
import pl.isigmas.kaucjapp.auth.repository.PasswordTokenRepository;
import pl.isigmas.kaucjapp.auth.repository.RefreshTokenRepository;
import pl.isigmas.kaucjapp.auth.security.Encoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceHandleUserDeletedTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private TokenService tokenService;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private ActivationTokenRepository activationTokenRepository;
    @Mock
    private DeletionScheduleRepository deletionScheduleRepository;
    @Mock
    private PasswordTokenRepository passwordTokenRepository;
    @Mock
    private AuthKafkaPublisher kafkaPublisher;
    @Mock
    private Encoder encoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void handleUserDeleted_activeAccount_anonymizesAndSchedulesDeletion() {
        Long accountId = 3L;
        Account account = new Account();
        account.setId(accountId);
        account.setEmail("goat@example.com");
        account.setUsername("GOAT123");
        account.setPasswordHash("old-hash");
        account.setStatus(AccountStatus.ACTIVE);

        RefreshToken token = new RefreshToken();
        token.setRevoked(false);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(refreshTokenRepository.findAllByAccount(account)).thenReturn(List.of(token));
        when(encoder.hashPassword(any())).thenReturn("new-hash");

        authService.handleUserDeleted(accountId);

        assertThat(token.isRevoked()).isTrue();
        assertThat(account.getEmail()).endsWith("@deleted.user");
        assertThat(account.getUsername()).startsWith("deleted#");
        assertThat(account.getPasswordHash()).isEqualTo("new-hash");
        assertThat(account.getStatus()).isEqualTo(AccountStatus.PENDING_DELETION);
        verify(deletionScheduleRepository).save(any(DeletionSchedule.class));
    }

    @Test
    void handleUserDeleted_pendingDeletion_onlyRotatesPassword() {
        Long accountId = 3L;
        Account account = new Account();
        account.setId(accountId);
        account.setEmail("x@deleted.user");
        account.setUsername("deleted#seed");
        account.setPasswordHash("old-hash");
        account.setStatus(AccountStatus.PENDING_DELETION);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(refreshTokenRepository.findAllByAccount(account)).thenReturn(List.of());
        when(encoder.hashPassword(any())).thenReturn("new-hash");

        authService.handleUserDeleted(accountId);

        assertThat(account.getPasswordHash()).isEqualTo("new-hash");
        verify(deletionScheduleRepository, never()).save(any());
    }
}
