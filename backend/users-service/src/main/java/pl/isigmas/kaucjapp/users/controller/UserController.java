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
import java.util.Map;

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
            description = "Returns UserDTO: user_id, username, names, phone, bottle/can stats, and nested addresses. "
                    + "Email is not included; use admin user listing for email.")
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
            @ApiResponse(responseCode = "204", description = "Profile updated."),
            @ApiResponse(responseCode = "400", description = "Validation (VALIDATION_ERR, field details in validationErrors), "
                    + "malformed JSON (MALFORMED_JSON), or DB range/length mapped to client error."),
            @ApiResponse(responseCode = "404", description = "User not found (USER_001).")
    })
    public ResponseEntity<Void> update(
            @Valid @RequestBody UpdateUserDTO updateUserDTO,
            @RequestHeader("X-User-Id") Long loggedInUserId) {

        userService.updateUser(loggedInUserId, updateUserDTO);
        log.info("User updated, ID: {}", loggedInUserId);
        return ResponseEntity.noContent().build();
    }



    @DeleteMapping("/me")
    @Operation(
            summary = "Delete my account",
            description = "Deletes the user (and dependent data per JPA cascade) for id from `X-User-Id`.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User deleted."),
            @ApiResponse(responseCode = "400", description = "Missing or invalid X-User-Id (BAD_REQUEST)."),
            @ApiResponse(responseCode = "404", description = "User not found (USER_001).")
    })
    public ResponseEntity<Void> delete(
            @RequestHeader("X-User-Id") Long loggedInUserId) {

        userService.deleteUser(loggedInUserId);
        log.info("User deleted, ID: {}", loggedInUserId);
        return ResponseEntity.noContent().build();
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
            summary = "Submit review for user",
            description = "Body: ReviewRequestDTO with score (1–5) and optional comment. "
                    + "Path `id` is the reviewed user; header `X-User-Id` is the reviewer. "
                    + "Creates an individual review and updates the denormalized rating aggregate. Self-review is rejected.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Review recorded; running average updated."),
            @ApiResponse(responseCode = "400", description = "Invalid score or body (VALIDATION_ERR)."),
            @ApiResponse(responseCode = "403", description = "Cannot review yourself (USER_004)."),
            @ApiResponse(responseCode = "404", description = "Reviewed user not found (USER_001).")
    })
    public ResponseEntity<Void> rateUser(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequestDTO request,
            @RequestHeader("X-User-Id") Long currentUserId) {

        ratingService.addReview(id, currentUserId, request);
        log.info("User {} added review (score {}) for user ID: {}", currentUserId, request.getScore(), id);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping("/reviews/{id}")
    @Operation(summary = "Update own review", description = "Partial update of score and/or comment. Only the original reviewer may edit.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Review updated; aggregate recalculated when score changes."),
            @ApiResponse(responseCode = "400", description = "Invalid score (VALIDATION_ERR)."),
            @ApiResponse(responseCode = "403", description = "Not the review author (USER_007)."),
            @ApiResponse(responseCode = "404", description = "Review not found (USER_006).")
    })
    public ResponseEntity<Void> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewDTO request,
            @RequestHeader("X-User-Id") Long currentUserId) {

        ratingService.updateReview(id, currentUserId, request);
        log.info("User {} updated review (score {}) for user ID: {}", currentUserId, request.getScore(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Delete own review", description = "Removes the review and updates the denormalized rating aggregate. Only the original reviewer may delete.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Review deleted; aggregate recalculated."),
            @ApiResponse(responseCode = "403", description = "Not the review author (USER_007)."),
            @ApiResponse(responseCode = "404", description = "Review not found (USER_006).")
    })
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId) {

        ratingService.deleteReview(id, currentUserId);
        log.info("User {} deleted review for user ID: {}", currentUserId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reviews/{id}")
    public ResponseEntity<ReviewResponseDTO> getReview(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId) {

        var review = ratingService.getReview(id);
        log.info("Getting review {} for user ID: {}", id, currentUserId);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/reviews/check")
    @Operation(
            summary = "Check if offer is already reviewed",
            description = "Returns true if the logged-in user (from X-User-Id) has already submitted a review for this specific offer.")
    public ResponseEntity<Map<String, Boolean>> checkReviewStatus(
            @RequestParam Long offerId,
            @RequestHeader("X-User-Id") Long currentUserId) {

        boolean alreadyReviewed = ratingService.hasUserReviewedOffer(currentUserId, offerId);
        return ResponseEntity.ok(Map.of("already_reviewed", alreadyReviewed));
    }


    @GetMapping("/{id}/reviews")
    @Operation(
            summary = "List reviews for user",
            description = "Returns all individual reviews for the given user id, newest first.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JSON array of ReviewResponseDTO."),
            @ApiResponse(responseCode = "404", description = "User not found (USER_001).")
    })
    public ResponseEntity<List<ReviewResponseDTO>> getUserReviews(@PathVariable Long id) {
        log.info("Fetching reviews for user ID: {}", id);
        return ResponseEntity.ok(ratingService.getUserReviews(id));
    }

    @GetMapping("/ranking")
    @Operation(
            summary = "Get top users ranking by activity type with pagination",
            description = "Available types: returned_plastic, returned_can, collected_plastic, collected_can, returned_total, collected_total"
    )
    public ResponseEntity<List<UserDTO>> getStatsRanking(
            @RequestParam(defaultValue = "returned_total") String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Getting stats ranking for type: {}, page: {}, size: {}", type, page, size);
        List<UserDTO> ranking = userService.getStatsRanking(type, page, size);
        return ResponseEntity.ok(ranking);
    }

}
