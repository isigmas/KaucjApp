package pl.isigmas.kaucjapp.notification.listener;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.notification.dto.MailRequest;
import pl.isigmas.kaucjapp.notification.service.MailService;
import pl.isigmas.kaucjapp.notification.util.TemplateType;

@Component
@RequiredArgsConstructor
public class NotificationKafkaListener {

    private final MailService mailService;

    @KafkaListener(topics = "notification.mail.welcome", groupId = "notification-group")
    public void handleWelcomeEmail(MailRequest mailRequest) {
        mailService.sendMail(
                "Aktywacja konta",
                mailRequest.getUsername(),
                mailRequest.getEmailTo(),
                mailRequest.getMessage(),
                TemplateType.WELCOME
        );
    }

    @KafkaListener(topics = "notification.mail.resetpassword", groupId = "notification-group")
    public void handleResetPasswordEmail(MailRequest mailRequest) {
        mailService.sendMail(
                "Reset hasła",
                mailRequest.getUsername(),
                mailRequest.getEmailTo(),
                mailRequest.getMessage(),
                TemplateType.RESET_PASSWORD
        );
    }
}
