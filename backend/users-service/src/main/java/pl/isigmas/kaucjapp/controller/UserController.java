package pl.isigmas.kaucjapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.DTO.UserDTO;
import pl.isigmas.kaucjapp.service.UserService;
import pl.isigmas.kaucjapp.service.RatingService;
import pl.isigmas.kaucjapp.DTO.RatingDTO;
import pl.isigmas.kaucjapp.DTO.RatingRequestDTO;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<Long> create(@Valid @RequestBody UserDTO newUser) {
        UserDTO createdUser = userService.createUser(newUser);
        log.info("New user created, ID: {}", createdUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser.getId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        log.info("Fetching user with ID: {}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/test")
    public ResponseEntity<String> get200() {
        return ResponseEntity.ok("Ready");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
            @PathVariable Long id,
            @Valid @RequestBody UserDTO updatedUser,
            @RequestHeader("X-User-Id") Long loggedInUserId) {

        if (!id.equals(loggedInUserId)) {
            log.warn("User {} tried to update profile of user {}", loggedInUserId, id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        userService.updateUser(id, updatedUser);
        log.info("User updated, ID: {}", id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long loggedInUserId) {

        if (!id.equals(loggedInUserId)) {
            log.warn("User {} tried to delete profile of user {}", loggedInUserId, id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        userService.deleteUser(id);
        log.info("User deleted, ID: {}", id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/rating")
    public ResponseEntity<RatingDTO> getUserRating(@PathVariable Long id) {
        log.info("Fetching rating for user ID: {}", id);
        return ResponseEntity.ok(ratingService.getRatingDTO(id));
    }

    @PostMapping("/{id}/rating")
    public ResponseEntity<Void> addRating(
            @PathVariable Long id,
            @Valid @RequestBody RatingRequestDTO ratingRequest,
            @RequestHeader("X-User-Id") Long raterId) {

        ratingService.addRating(id, ratingRequest.getScore(), raterId);
        log.info("User {} added rating {} for user ID: {}", raterId, ratingRequest.getScore(), id);
        return ResponseEntity.ok().build();
    }
}