package pl.isigmas.kaucjapp.auth.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.auth.service.AuthService;

@Slf4j
@RestController
@RequestMapping("/api/auth/admin")
@RequiredArgsConstructor
public class AuthAdminController {

    private final AuthService service;

    @PostMapping("/suspend/{id}")
    public ResponseEntity<Void> suspendAccount(@PathVariable Long id) {
        service.suspend(id);
        log.info("Account suspended");

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        service.delete(id);
        log.info("Account deleted");

        return ResponseEntity.ok().build();
    }
}
