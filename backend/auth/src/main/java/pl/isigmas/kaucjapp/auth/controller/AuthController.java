package pl.isigmas.kaucjapp.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.auth.dto.request.LoginCredentials;
import pl.isigmas.kaucjapp.auth.service.AuthService;
import pl.isigmas.kaucjapp.auth.dto.request.User;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        return ResponseEntity.ok("Ready");
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @Valid @RequestBody User newUser
    ) {
        service.create(newUser);
        log.info("New user created");

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginCredentials credentials
            ) {
        String token = service.login(credentials);

        return ResponseEntity.ok(token);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody String token) {
        service.logout(token);
        log.info("Logout successful");

        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(@RequestBody String token) {
        String newToken = service.generateJWT(token);
        log.info("Refresh successful");

        return ResponseEntity.ok(newToken);
    }

    @GetMapping("/activate/{token}")
    public ResponseEntity<Void> activate(@PathVariable String token) {
        service.activate(token);
        log.info("Activate successful");

        return ResponseEntity.ok().build();
    }
}
