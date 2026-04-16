package pl.isigmas.kaucjapp.auth.client;

import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import pl.isigmas.kaucjapp.auth.dto.request.MailRequest;

@FeignClient(name = "notification-service", url = "${NOTIFICATION_SERVICE_URL}")
public interface NotificationClient {

    @PostMapping("/api/notification/mail/welcome")
    ResponseEntity<Void> sendWelcomeEmail(@Valid MailRequest mailRequest);
}
