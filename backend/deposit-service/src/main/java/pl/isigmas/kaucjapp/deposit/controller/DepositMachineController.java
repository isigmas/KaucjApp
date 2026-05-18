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
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineRequestDTO;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineResponseDTO;
import pl.isigmas.kaucjapp.deposit.DTO.ReviewRequestDTO;
import pl.isigmas.kaucjapp.deposit.DTO.UpdateMachineDTO;
import pl.isigmas.kaucjapp.deposit.service.DepositMachineService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/deposit")
@RequiredArgsConstructor
@Validated
public class DepositMachineController {

    private final DepositMachineService depositMachineService;

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

    @PostMapping("machine/{id}/rating")
    public ResponseEntity<ReviewRequestDTO> getDepositMachine(
            @Valid @RequestBody ReviewRequestDTO reviewRequestDTO,
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId
    ) {
        log.info("Creating review for deposit machine with id {} by user {}",id, userId);
        depositMachineService.createReview(reviewRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();

    }

}
