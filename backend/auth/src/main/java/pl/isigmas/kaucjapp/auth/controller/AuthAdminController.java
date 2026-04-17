package pl.isigmas.kaucjapp.auth.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
}
