package pl.isigmas.kaucjapp.deposit.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/machine")
    public ResponseEntity<Void> addNewMachine(
            @RequestBody DepositMachineResponseDTO depositMachineResponseDTO
    ){
        depositMachineService.addNewMachine(depositMachineResponseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("machine/{id}")
    public ResponseEntity<Void> update(
            @RequestBody UpdateMachineDTO updateMachineDTO,
            @PathVariable Long id
    ){
        depositMachineService.updateMachine(id ,updateMachineDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("machine/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ){
        depositMachineService.delete(id);
        return ResponseEntity.ok().build();
    }
}