package pl.isigmas.kaucjapp.users.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.users.DTO.*;
import pl.isigmas.kaucjapp.users.service.UserService;
import pl.isigmas.kaucjapp.users.service.RatingService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profiles, addresses, and ratings. Trusted caller must send X-User-Id where noted.")
public class UserController {

    private final UserService userService;
    private final RatingService ratingService;

    @PostMapping("/user")
    @Operation(
            summary = "Create user profile",
            description = "Creates a user record with the id from the X-User-Id header (typically set by the API gateway after identity is established). "
                    + "Request body must not include a user id.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Profile created; response body is the user id."),
            @ApiResponse(responseCode = "400", description = "Invalid payload or missing X-User-Id header."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (if enforced upstream).")
    })
    public ResponseEntity<Long> create(
            @RequestHeader("X-User-Id") Long authId,
            @Valid @RequestBody CreateUserDTO newUser) {
        UserDTO createdUser= userService.createUser(authId,newUser);
        log.info("New user created, ID: {}", createdUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser.getId());
    }

    @GetMapping("/me/addresses")
    @Operation(
            summary = "List my addresses",
            description = "Returns all addresses for the user identified by the X-User-Id header.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of addresses (may be empty)."),
            @ApiResponse(responseCode = "400", description = "Missing or invalid X-User-Id header."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (if enforced upstream)."),
            @ApiResponse(responseCode = "404", description = "User not found for the given id.")
    })
    public ResponseEntity<List<UserAddressDTO>> getMyAddresses(
            @RequestHeader("X-User-Id") Long myUserId) {

        log.info("Fetching addresses for user: {}", myUserId);
        return ResponseEntity.ok(userService.getUserAddresses(myUserId));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get user by id",
            description = "Returns the full user profile including addresses.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User found."),
            @ApiResponse(responseCode = "404", description = "No user with this id.")
    })
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        log.info("Fetching user with ID: {}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/test")
    @Operation(
            summary = "User service test",
            description = "Lightweight endpoint to verify this service responds under /api/user/test.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plain text readiness hint.")
    })
    public ResponseEntity<String> get200() {
        return ResponseEntity.ok("Ready");
    }

    @PutMapping("/me")
    @Operation(
            summary = "Update user profile",
            description = "Updates profile and replaces addresses. Path id must match X-User-Id (only the owner may update).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile updated."),
            @ApiResponse(responseCode = "400", description = "Validation error or missing X-User-Id."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (if enforced upstream)."),
            @ApiResponse(responseCode = "404", description = "User not found.")
    })
    public ResponseEntity<Void> update(
            @Valid @RequestBody UserDTO updatedUser,
            @RequestHeader("X-User-Id") Long loggedInUserId) {

        userService.updateUser(loggedInUserId, updatedUser);
        log.info("User updated, ID: {}", loggedInUserId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me")
    @Operation(
            summary = "Delete user account",
            description = "Deletes the user. Path id must match X-User-Id.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User deleted."),
            @ApiResponse(responseCode = "400", description = "Missing or invalid X-User-Id header."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (if enforced upstream)."),
            @ApiResponse(responseCode = "404", description = "User not found.")
    })
    public ResponseEntity<Void> delete(
            @RequestHeader("X-User-Id") Long loggedInUserId) {

        userService.deleteUser(loggedInUserId);
        log.info("User deleted, ID: {}", loggedInUserId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/rating")
    @Operation(
            summary = "Get user rating",
            description = "Returns average score and feedback count for the user.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rating summary returned."),
            @ApiResponse(responseCode = "404", description = "User or rating aggregate not found.")
    })
    public ResponseEntity<RatingDTO> getUserRating(@PathVariable Long id) {
        log.info("Fetching rating for user ID: {}", id);
        return ResponseEntity.ok(ratingService.getRatingDTO(id));
    }

    @PostMapping("/{id}/rating")
    @Operation(
            summary = "Submit rating for user",
            description = "Adds a score (validated body) for the rated user. X-User-Id identifies the rater; cannot rate yourself.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rating recorded."),
            @ApiResponse(responseCode = "400", description = "Invalid score or request body."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (if enforced upstream)."),
            @ApiResponse(responseCode = "403", description = "Rater is not allowed (e.g. self-rating)."),
            @ApiResponse(responseCode = "404", description = "Rated user not found.")
    })
    public ResponseEntity<Void> addRating(
            @PathVariable Long id,
            @Valid @RequestBody RatingRequestDTO ratingRequest,
            @RequestHeader("X-User-Id") Long raterId) {

        ratingService.addRating(id, ratingRequest.getScore(), raterId);
        log.info("User {} added rating {} for user ID: {}", raterId, ratingRequest.getScore(), id);
        return ResponseEntity.ok().build();
    }


}