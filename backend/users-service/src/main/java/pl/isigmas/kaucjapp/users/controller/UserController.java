package pl.isigmas.kaucjapp.users.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Tag(
        name = "Users",
        description = "Profiles, addresses, and ratings. "
                + "Endpoints under /me and /me/addresses require header X-User-Id (identity is trusted from the gateway or caller in this service). "
                + "Internal creation uses POST /user with X-Internal-Secret. "
                + "Errors use ApiError: errorCode, message, path, optional validationErrors.")
public class UserController {

    private final UserService userService;
    private final RatingService ratingService;


    @GetMapping("/admin/users")
    @Operation(
            summary = "List all users",
            description = "Returns all users located in db"
    )
    public ResponseEntity<List<UserAdminDTO>> getAllUsers(){
        log.info("Getting all users");
        return ResponseEntity.ok(userService.getAll());
    }



    @GetMapping("/me/addresses")
    @Operation(
            summary = "List my addresses",
            description = "Returns all saved addresses for the user id from header `X-User-Id`. "
                    + "Coordinates in each item are validated on write (latitude -90..90, longitude -180..180).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JSON array of UserAddressDTO (may be empty)."),
            @ApiResponse(responseCode = "400", description = "Missing or invalid X-User-Id (BAD_REQUEST)."),
            @ApiResponse(responseCode = "404", description = "User not found (USER_001).")
    })
    public ResponseEntity<List<UserAddressDTO>> getMyAddresses(
            @RequestHeader("X-User-Id") Long myUserId) {

        log.info("Fetching addresses for user: {}", myUserId);
        return ResponseEntity.ok(userService.getUserAddresses(myUserId));
    }




    @GetMapping("/{id}")
    @Operation(
            summary = "Get user by id",
            description = "Returns UserDTO: user_id, username, names, phone, email, and nested addresses.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User found."),
            @ApiResponse(responseCode = "404", description = "User not found (USER_001).")
    })
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        log.info("Fetching user with ID: {}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }




    @GetMapping("/me")
    @Operation(
            summary = "Get my profile",
            description = "Same as GET /{id} but the id is taken from header `X-User-Id`.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "UserDTO for the caller."),
            @ApiResponse(responseCode = "400", description = "Missing or invalid X-User-Id (BAD_REQUEST)."),
            @ApiResponse(responseCode = "404", description = "User not found (USER_001).")
    })
    public ResponseEntity<UserDTO> getMe(
            @RequestHeader("X-User-Id") Long myUserId
    ) {
        log.info("Fetching user with ID: {}",myUserId);
        return ResponseEntity.ok(userService.getUserById(myUserId));
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




    @PatchMapping("/me")
    @Operation(
            summary = "Partially update my profile",
            description = "Patch body: UpdateUserDTO. All fields are optional (omit or null = leave unchanged). "
                    + "`firstName` / `lastName`: when sent, must be 1–100 characters. "
                    + "`addresses`: when omitted or null, existing addresses are not changed; when sent (including `[]`), "
                    + "the list replaces all addresses (full replace). "
                    + "Username, email, and phone cannot be updated via this API (not present on UpdateUserDTO). "
                    + "Each address: latitude ∈ [-90, 90], longitude ∈ [-180, 180], address length limits per UserAddressDTO.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile updated."),
            @ApiResponse(responseCode = "400", description = "Validation (VALIDATION_ERR, field details in validationErrors), "
                    + "malformed JSON (MALFORMED_JSON), or DB range/length mapped to client error."),
            @ApiResponse(responseCode = "404", description = "User not found (USER_001).")
    })
    public ResponseEntity<Void> update(
            @Valid @RequestBody UpdateUserDTO updateUserDTO,
            @RequestHeader("X-User-Id") Long loggedInUserId) {

        userService.updateUser(loggedInUserId, updateUserDTO);
        log.info("User updated, ID: {}", loggedInUserId);
        return ResponseEntity.ok().build();
    }



    @DeleteMapping("/me")
    @Operation(
            summary = "Delete my account",
            description = "Deletes the user (and dependent data per JPA cascade) for id from `X-User-Id`.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User deleted."),
            @ApiResponse(responseCode = "400", description = "Missing or invalid X-User-Id (BAD_REQUEST)."),
            @ApiResponse(responseCode = "404", description = "User not found (USER_001).")
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
            description = "Returns RatingDTO: user_id, avg_score, feedback_count for the given user id.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rating summary."),
            @ApiResponse(responseCode = "404", description = "Rating aggregate not found (USER_002).")
    })
    public ResponseEntity<RatingDTO> getUserRating(@PathVariable Long id) {
        log.info("Fetching rating for user ID: {}", id);
        return ResponseEntity.ok(ratingService.getRatingDTO(id));
    }


    

    @PostMapping("/{id}/rating")
    @Operation(
            summary = "Submit rating for user",
            description = "Body: integer score between 1 and 5 (RatingRequestDTO). "
                    + "Path `id` is the rated user; header `X-User-Id` is the rater. Self-rating is rejected.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Rating recorded; running average updated."),
            @ApiResponse(responseCode = "400", description = "Invalid score or body (VALIDATION_ERR)."),
            @ApiResponse(responseCode = "403", description = "Cannot rate yourself (USER_004)."),
            @ApiResponse(responseCode = "404", description = "Rated user / rating row not found (USER_001).")
    })
    public ResponseEntity<Void> addRating(
            @PathVariable Long id,
            @Valid @RequestBody RatingRequestDTO ratingRequest,
            @RequestHeader("X-User-Id") Long raterId) {

        ratingService.addRating(id, ratingRequest.getScore(), raterId);
        log.info("User {} added rating {} for user ID: {}", raterId, ratingRequest.getScore(), id);
        return ResponseEntity.noContent().build();
    }


}
