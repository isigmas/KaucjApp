package pl.isigmas.kaucjapp.deposit.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
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

    @GetMapping("/test")
    public ResponseEntity<String> get200() {
        return ResponseEntity.ok("Ready");
    }

    @GetMapping("/machines")
    public ResponseEntity<List<DepositMachineResponseDTO>> getAllMachines() {
        log.info("Getting all machines");
        List<DepositMachineResponseDTO> machines = depositMachineService.getAll();
        return ResponseEntity.ok(machines);
    }

    @GetMapping("/search")
    public ResponseEntity<List<DepositMachineResponseDTO>> searchDepositMachinesInArea(
            @RequestParam @DecimalMin(value = "-90.0", inclusive = true) @DecimalMax(value = "90.0", inclusive = true) double swLat,
            @RequestParam @DecimalMin(value = "-180.0", inclusive = true) @DecimalMax(value = "180.0", inclusive = true) double swLon,
            @RequestParam @DecimalMin(value = "-90.0", inclusive = true) @DecimalMax(value = "90.0", inclusive = true) double neLat,
            @RequestParam @DecimalMin(value = "-180.0", inclusive = true) @DecimalMax(value = "180.0", inclusive = true) double neLon) {
        log.info("Searching for machines in bbox {} {} {} {}",swLat,swLon,neLat,neLon);
        return ResponseEntity.ok(depositMachineService.getDepositMachinesInArea(swLat, swLon, neLat, neLon));
    }

    @PostMapping("/machine")
    public ResponseEntity<Void> addNewMachine(
            @Valid @RequestBody DepositMachineRequestDTO depositMachineRequestDTO
    ) {
        log.info("Creating deposit machine");
        depositMachineService.addNewMachine(depositMachineRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping("/machine/{id}")
    public ResponseEntity<Void> update(
            @Valid @RequestBody UpdateMachineDTO updateMachineDTO,
            @PathVariable Long id
    ) {
        log.info("Updating deposit machine with id {}",id);
        depositMachineService.updateMachine(id, updateMachineDTO);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/machine/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        log.info("Deleting deposit machine with id {}",id);
        depositMachineService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/machine/{id}")
    public ResponseEntity<DepositMachineResponseDTO> getDepositMachine(
            @PathVariable Long id
    ) {
        log.info("Getting deposit machine with id {}",id);
        DepositMachineResponseDTO depositMachineResponseDTO = depositMachineService.getDepositMachine(id);
        return ResponseEntity.ok(depositMachineResponseDTO);
    }

    @PostMapping("/machine/{id}/rating")
    public ResponseEntity<Void> createReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequestDTO reviewRequestDTO,
            @RequestHeader("X-User-Id") Long userId) {
        log.info("Creating review for deposit machine {} by user {}", id, userId);
        ratingService.createReview(id, userId, reviewRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/machine/{id}/reviews")
    public ResponseEntity<List<ReviewResponseDTO>> getDepositMachineReviews(@PathVariable Long id) {
        log.info("Fetching reviews for deposit machine {}", id);
        return ResponseEntity.ok(ratingService.getDepositMachineReviews(id));
    }

    @PatchMapping("/reviews/{id}")
    public ResponseEntity<Void> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewDTO request,
            @RequestHeader("X-User-Id") Long userId) {
        log.info("User {} updating review {}", userId, id);
        ratingService.updateReview(id, userId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        log.info("User {} deleting review {}", userId, id);
        ratingService.deleteReview(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/machine/{id}/rating")
    public ResponseEntity<RatingDTO> getRating(
            @PathVariable Long id
    )
    {
        log.info("Fetching rating for machine id {}",id);
        RatingDTO ratingDTO = ratingService.getRatingDTO(id);
        return ResponseEntity.ok(ratingDTO);
    }

}
