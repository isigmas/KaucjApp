package pl.isigmas.kaucjapp.deposit.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineResponseDTO;
import pl.isigmas.kaucjapp.deposit.DTO.UpdateMachineDTO;
import pl.isigmas.kaucjapp.deposit.service.DepositMachineService;

import java.util.List;

@RestController
@RequestMapping("/api/deposit")
@RequiredArgsConstructor
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

    @PostMapping("machine/add")
    public ResponseEntity<Void> addNewMachine(
        DepositMachineResponseDTO depositMachineResponseDTO
    ){
        depositMachineService.addNewMachine(depositMachineResponseDTO);
        return ResponseEntity.ok().build();
    }

    @PutMapping("machine/{id}")
    public ResponseEntity<Void> update(
            @Valid @RequestBody UpdateMachineDTO updateMachineDTO,
            @PathVariable Long id
    ){
        depositMachineService.updateMachine(updateMachineDTO);
        return ResponseEntity.ok().build();
    }
}