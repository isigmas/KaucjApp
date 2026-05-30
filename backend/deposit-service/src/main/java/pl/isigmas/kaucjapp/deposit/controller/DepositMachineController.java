package pl.isigmas.kaucjapp.deposit.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.deposit.DTO.*;
import pl.isigmas.kaucjapp.deposit.service.DepositMachineService;
import pl.isigmas.kaucjapp.deposit.service.RatingService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/deposit")
@RequiredArgsConstructor
@Validated
public class DepositMachineController {

    private final DepositMachineService depositMachineService;
    private final RatingService ratingService;
    private final Logger logger;

    @GetMapping("/test")
    public ResponseEntity<String> get200() {
        return ResponseEntity.ok("Ready");
    }

    @GetMapping("/machines")
    public ResponseEntity<List<DepositMachineResponseDTO>> getAllMachines() {
        log.info("Getting all machines");
        logger.info("Getting all deposit machines");
        List<DepositMachineResponseDTO> machines = depositMachineService.getAll();
        return ResponseEntity.ok(machines);
    }

    @GetMapping("/search")
    public ResponseEntity<List<DepositMachineResponseDTO>> searchDepositMachinesInArea(
            @RequestParam @DecimalMin(value = "-90.0", inclusive = true) @DecimalMax(value = "90.0", inclusive = true) double swLat,
            @RequestParam @DecimalMin(value = "-180.0", inclusive = true) @DecimalMax(value = "180.0", inclusive = true) double swLon,
            @RequestParam @DecimalMin(value = "-90.0", inclusive = true) @DecimalMax(value = "90.0", inclusive = true) double neLat,
            @RequestParam @DecimalMin(value = "-180.0", inclusive = true) @DecimalMax(value = "180.0", inclusive = true) double neLon) {
        log.info("Searching for machines in bbox {} {} {} {}", swLat, swLon, neLat, neLon);
        logger.info("Searching deposit machines in bbox SW[%s, %s] NE[%s, %s]".formatted(swLat, swLon, neLat, neLon));
        return ResponseEntity.ok(depositMachineService.getDepositMachinesInArea(swLat, swLon, neLat, neLon));
    }

    @PostMapping("/machine")
    public ResponseEntity<Void> addNewMachine(
            @Valid @RequestBody DepositMachineRequestDTO depositMachineRequestDTO
    ) {
        log.info("Creating deposit machine");
        logger.info("Creating deposit machine at %s".formatted(depositMachineRequestDTO.getAddress()));
        depositMachineService.addNewMachine(depositMachineRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping("/machine/{id}")
    public ResponseEntity<Void> update(
            @Valid @RequestBody UpdateMachineDTO updateMachineDTO,
            @PathVariable Long id
    ) {
        log.info("Updating deposit machine with id {}", id);
        logger.info("Updating deposit machine ID: %d".formatted(id));
        depositMachineService.updateMachine(id, updateMachineDTO);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/machine/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        log.info("Deleting deposit machine with id {}", id);
        logger.info("Deleting deposit machine ID: %d".formatted(id));
        depositMachineService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/machine/{id}")
    public ResponseEntity<DepositMachineResponseDTO> getDepositMachine(
            @PathVariable Long id
    ) {
        log.info("Getting deposit machine with id {}", id);
        logger.info("Getting deposit machine ID: %d".formatted(id));
        DepositMachineResponseDTO depositMachineResponseDTO = depositMachineService.getDepositMachine(id);
        return ResponseEntity.ok(depositMachineResponseDTO);
    }

    @PostMapping("/machine/{id}/rating")
    public ResponseEntity<Void> createReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequestDTO reviewRequestDTO,
            @RequestHeader("X-User-Id") Long userId) {
        log.info("Creating review for deposit machine {} by user {}", id, userId);
        logger.info("Creating review for deposit machine ID: %d by user ID: %d".formatted(id, userId));
        ratingService.createReview(id, userId, reviewRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/machine/{id}/reviews")
    public ResponseEntity<List<ReviewResponseDTO>> getDepositMachineReviews(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        log.info("Fetching reviews for deposit machine {} for user {}", id, userId);
        logger.info("Fetching reviews for deposit machine ID: %d".formatted(id));
        return ResponseEntity.ok(ratingService.getDepositMachineReviews(id, userId));
    }

    @PatchMapping("/reviews/{id}")
    public ResponseEntity<Void> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewDTO request,
            @RequestHeader("X-User-Id") Long userId) {
        log.info("User {} updating review {}", userId, id);
        logger.info("User ID: %d updating review ID: %d".formatted(userId, id));
        ratingService.updateReview(id, userId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        log.info("User {} deleting review {}", userId, id);
        logger.info("User ID: %d deleting review ID: %d".formatted(userId, id));
        ratingService.deleteReview(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reviews/check")
    @Operation(
            summary = "Check if deposit machineś is already reviewed",
            description = "Returns true and the review details if the logged-in user has already submitted a review for this deposit machine.")
    public ResponseEntity<ReviewCheckResponseDTO> checkReviewStatus(
            @RequestParam Long id,
            @RequestHeader("X-User-Id") Long currentUserId) {

        return ratingService.getReviewForDepositMachine(currentUserId, id)
                .map(review -> ResponseEntity.ok(
                        ReviewCheckResponseDTO.builder()
                                .alreadyReviewed(true)
                                .review(review)
                                .build()
                ))
                .orElseGet(() -> ResponseEntity.ok(
                        ReviewCheckResponseDTO.builder()
                                .alreadyReviewed(false)
                                .review(null)
                                .build()
                ));
    }

}
