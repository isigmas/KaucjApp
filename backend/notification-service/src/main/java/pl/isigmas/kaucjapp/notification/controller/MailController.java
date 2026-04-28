package pl.isigmas.kaucjapp.notification.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.notification.dto.MailRequest;
import pl.isigmas.kaucjapp.notification.service.MailService;
import pl.isigmas.kaucjapp.notification.util.TemplateType;

@RestController
@RequestMapping("/api/notification/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Ready!");
    }

    @PostMapping("/welcome")
    public ResponseEntity<Void> sendWelcomeEmail(
            @Valid @RequestBody MailRequest mailRequest
    ) {
        mailService.sendMail("Aktywacja konta",mailRequest.getUsername(),mailRequest.getEmailTo(), mailRequest.getMessage(), TemplateType.WELCOME);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/resetpassword")
    public ResponseEntity<Void> sendResetPasswordEmail(
            @Valid @RequestBody MailRequest mailRequest
    ) {
        mailService.sendMail("Reset hasła",mailRequest.getUsername(),mailRequest.getEmailTo(), mailRequest.getMessage(), TemplateType.RESET_PASSWORD);

        return ResponseEntity.ok().build();
    }
}
