package pl.isigmas.kaucjapp.notification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification/mail")
@RequiredArgsConstructor
public class MailController {

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Ready!");
    }
}
