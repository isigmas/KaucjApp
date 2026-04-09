package pl.isigmas.kaucjapp.deposit.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineResponseDTO;
import pl.isigmas.kaucjapp.deposit.service.DepositMachineService;

import java.util.List;

@RestController
@RequestMapping("/api/deposit")
@RequiredArgsConstructor
public class DepositMachineController {

    private final DepositMachineService depositMachineService;

    @GetMapping("/machines")
    public ResponseEntity<List<DepositMachineResponseDTO>> getMockedMachines() {
        List<DepositMachineResponseDTO> machines = depositMachineService.getMockedMachines();
        return ResponseEntity.ok(machines);
    }
}