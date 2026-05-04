package pl.isigmas.kaucjapp.auth.publisher;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.auth.dto.request.MailRequest;
import pl.isigmas.kaucjapp.auth.dto.request.UsersServiceUser;

@Component
@RequiredArgsConstructor
public class AuthKafkaPublisher {

    private final KafkaTemplate<String, MailRequest> kafkaTemplate;
    private final KafkaTemplate<String, UsersServiceUser> userTemplate;
    private final KafkaTemplate<String, Long> idTemplate;

    // Notification

    public void sendWelcomeEmail(MailRequest mailRequest) {
        kafkaTemplate.send("notification.mail.welcome", mailRequest.getEmailTo(), mailRequest);
    }

    public void sendResetPasswordEmail(MailRequest mailRequest) {
        kafkaTemplate.send("notification.mail.resetpassword", mailRequest.getEmailTo(), mailRequest);
    }

    // Users

    public void sendSyncUser(UsersServiceUser user) {
        userTemplate.send("users.sync", user.getEmail(), user);
    }

    public void sendDeleteUser(Long id, String email) {
        idTemplate.send("users.delete", email, id);
    }
}
