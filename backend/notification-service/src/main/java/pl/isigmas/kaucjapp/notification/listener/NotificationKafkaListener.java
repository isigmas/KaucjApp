package pl.isigmas.kaucjapp.notification.listener;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.common.dto.WarningDTO;
import pl.isigmas.kaucjapp.notification.dto.MailRequest;
import pl.isigmas.kaucjapp.notification.service.EmailRetryService;
import pl.isigmas.kaucjapp.notification.service.WarningService;
import pl.isigmas.kaucjapp.notification.util.TemplateType;

@Component
@RequiredArgsConstructor
public class NotificationKafkaListener {

    private final EmailRetryService emailRetryService;
    private final WarningService warningService;

    @KafkaListener(topics = "notification.mail.welcome", groupId = "notification-group")
    public void handleWelcomeEmail(MailRequest mailRequest) {
        emailRetryService.sendWithRetry(
                "Aktywacja konta",
                mailRequest.getUsername(),
                mailRequest.getEmailTo(),
                mailRequest.getMessage(),
                TemplateType.WELCOME
        );
    }

    @KafkaListener(topics = "notification.mail.resetpassword", groupId = "notification-group")
    public void handleResetPasswordEmail(MailRequest mailRequest) {
        emailRetryService.sendWithRetry(
                "Reset hasła",
                mailRequest.getUsername(),
                mailRequest.getEmailTo(),
                mailRequest.getMessage(),
                TemplateType.RESET_PASSWORD
        );
    }

    @KafkaListener(topics = "notification.admin", groupId = "notification-group")
    public void handleAdminNotification(WarningDTO warning) {
        warningService.saveWarning(warning);
    }
}
