package pl.isigmas.kaucjapp.notification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.notification.entity.Warning;
import pl.isigmas.kaucjapp.notification.service.WarningService;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final WarningService warningService;

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Ready!");
    }

    @GetMapping("/admin/warnings")
    public ResponseEntity<List<Warning>> warnings() {

        List<Warning> warnings = warningService.getWarnings();

        return ResponseEntity.ok(warnings);
    }
}
