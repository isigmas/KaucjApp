package pl.isigmas.kaucjapp.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.auth.entity.Account;
import pl.isigmas.kaucjapp.auth.entity.DeletionSchedule;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;
import pl.isigmas.kaucjapp.auth.repository.AccountRepository;
import pl.isigmas.kaucjapp.auth.repository.DeletionScheduleRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountCleanupService {

    private final DeletionScheduleRepository deletionScheduleRepository;
    private final AccountRepository accountRepository;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanup() {
        log.info("Cleaning up deleted accounts");

        List<DeletionSchedule> expiredSchedules = deletionScheduleRepository.findAllByScheduledDeletionDateBefore(Instant.now());

        if (expiredSchedules.isEmpty()) {
            log.info("No account to cleanup");
            return;
        }

        for (DeletionSchedule schedule : expiredSchedules) {
            Account account = schedule.getAccount();

            account.setStatus(AccountStatus.DELETED);
        }
        deletionScheduleRepository.deleteAll(expiredSchedules);

        log.info("Cleaned up {} accounts", expiredSchedules.size());
    }
}
