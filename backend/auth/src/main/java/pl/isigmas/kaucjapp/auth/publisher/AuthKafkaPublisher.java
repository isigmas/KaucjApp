package pl.isigmas.kaucjapp.auth.publisher;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.auth.dto.request.MailRequest;

@Component
@RequiredArgsConstructor
public class AuthKafkaPublisher {

    private final KafkaTemplate<String, MailRequest> kafkaTemplate;

    public void sendWelcomeEmail(MailRequest mailRequest) {
        kafkaTemplate.send("notification.mail.welcome", mailRequest.getEmailTo(), mailRequest);
    }

    public void sendResetPasswordEmail(MailRequest mailRequest) {
        kafkaTemplate.send("notification.mail.resetpassword", mailRequest.getEmailTo(), mailRequest);
    }
}
