package pl.isigmas.kaucjapp.deposit.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineRequestDTO;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineResponseDTO;
import pl.isigmas.kaucjapp.deposit.DTO.UpdateMachineDTO;
import pl.isigmas.kaucjapp.deposit.service.DepositMachineService;

import java.util.List;

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
        List<DepositMachineResponseDTO> machines = depositMachineService.getAll();
        return ResponseEntity.ok(machines);
    }

    @GetMapping("/search")
    public ResponseEntity<List<DepositMachineResponseDTO>> searchDepositMachinesInArea(
            @RequestParam @DecimalMin(value = "-90.0", inclusive = true) @DecimalMax(value = "90.0", inclusive = true) double swLat,
            @RequestParam @DecimalMin(value = "-180.0", inclusive = true) @DecimalMax(value = "180.0", inclusive = true) double swLon,
            @RequestParam @DecimalMin(value = "-90.0", inclusive = true) @DecimalMax(value = "90.0", inclusive = true) double neLat,
            @RequestParam @DecimalMin(value = "-180.0", inclusive = true) @DecimalMax(value = "180.0", inclusive = true) double neLon) {
        return ResponseEntity.ok(depositMachineService.getDepositMachinesInArea(swLat, swLon, neLat, neLon));
    }

    @PostMapping("/machine")
    public ResponseEntity<Void> addNewMachine(
            @Valid @RequestBody DepositMachineRequestDTO depositMachineRequestDTO
    ) {
        depositMachineService.addNewMachine(depositMachineRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping("machine/{id}")
    public ResponseEntity<Void> update(
            @Valid @RequestBody UpdateMachineDTO updateMachineDTO,
            @PathVariable Long id
    ) {
        depositMachineService.updateMachine(id, updateMachineDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("machine/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        depositMachineService.delete(id);
        return ResponseEntity.ok().build();
    }
}
