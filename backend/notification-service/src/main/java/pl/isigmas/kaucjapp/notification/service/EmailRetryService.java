package pl.isigmas.kaucjapp.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.notification.entity.EmailRetryTask;
import pl.isigmas.kaucjapp.notification.repository.EmailRetryTaskRepository;
import pl.isigmas.kaucjapp.notification.util.TemplateType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailRetryService {

    private final MailService mailService;
    private final EmailRetryTaskRepository emailRetryTaskRepository;
    private final Logger logger;

    @Transactional
    public void sendWithRetry(String subject, String username, String email, String message, TemplateType templateType) {
        if (mailService.trySendMail(subject, username, email, message, templateType)) {
            return;
        }
        scheduleRetry(subject, username, email, message, templateType, 1);
    }

    @Scheduled(fixedRate = 5000)
    @Transactional
    public void processPendingRetries() {
        Instant now = Instant.now();
        List<EmailRetryTask> dueTasks = emailRetryTaskRepository.findByNextAttemptAtLessThanEqual(now);

        for (EmailRetryTask task : dueTasks) {
            processTask(task, now);
        }
    }

    private void processTask(EmailRetryTask task, Instant now) {
        boolean sent = mailService.trySendMail(
                task.getSubject(),
                task.getUsername(),
                task.getRecipientEmail(),
                task.getMessage(),
                task.getTemplateType()
        );

        if (sent) {
            emailRetryTaskRepository.delete(task);
            log.info("Email sent successfully on retry to {}", task.getRecipientEmail());
            return;
        }

        if (task.getAttemptCount() + 1 >= EmailRetryBackoffPolicy.MAX_ATTEMPTS) {
            // TODO: zaimplementować mechanizm ochronny (np. tabelę failed_emails), gdy ostatnia próba nie przejdzie, żeby e-mail ostatecznie nie uciekł
            emailRetryTaskRepository.delete(task);
            String discardMessage = "Email to %s discarded after %d failed attempts".formatted(
                    task.getRecipientEmail(),
                    EmailRetryBackoffPolicy.MAX_ATTEMPTS
            );
            log.warn(discardMessage);
            logger.error(discardMessage);
            return;
        }

        int nextAttemptCount = task.getAttemptCount() + 1;
        task.setAttemptCount(nextAttemptCount);
        task.setNextAttemptAt(now.plus(EmailRetryBackoffPolicy.intervalAfterAttempt(nextAttemptCount)));
        emailRetryTaskRepository.save(task);
        String retryMessage = "Email to %s failed (attempt %d/%d), next retry at %s".formatted(
                task.getRecipientEmail(),
                nextAttemptCount,
                EmailRetryBackoffPolicy.MAX_ATTEMPTS,
                task.getNextAttemptAt()
        );
        log.warn(retryMessage);
        logger.warn(retryMessage);
    }

    private void scheduleRetry(
            String subject,
            String username,
            String email,
            String message,
            TemplateType templateType,
            int attemptCount
    ) {
        Instant now = Instant.now();
        EmailRetryTask task = EmailRetryTask.builder()
                .id(UUID.randomUUID())
                .recipientEmail(email)
                .username(username)
                .subject(subject)
                .message(message)
                .templateType(templateType)
                .attemptCount(attemptCount)
                .nextAttemptAt(now.plus(EmailRetryBackoffPolicy.intervalAfterAttempt(attemptCount)))
                .createdAt(now)
                .build();

        emailRetryTaskRepository.save(task);
        String scheduleMessage = "Email to %s failed (attempt %d/%d), scheduled retry at %s".formatted(
                email,
                attemptCount,
                EmailRetryBackoffPolicy.MAX_ATTEMPTS,
                task.getNextAttemptAt()
        );
        log.warn(scheduleMessage);
        logger.warn(scheduleMessage);
    }
}
