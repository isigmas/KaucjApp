package pl.isigmas.kaucjapp.deposit.service;

import org.springframework.stereotype.Service;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineResponseDTO;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DepositMachineService {

    public List<DepositMachineResponseDTO> getMockedMachines() {
        return List.of(
                DepositMachineResponseDTO.builder()
                        .id(1L)
                        .networkName("Biedronka")
                        .status("AVAILABLE")
                        .address("ul. Przykładowa 1, Kraków")
                        .latitude(new BigDecimal("50.064650"))
                        .longitude(new BigDecimal("19.944980"))
                        .build(),
                DepositMachineResponseDTO.builder()
                        .id(2L)
                        .networkName("Lidl")
                        .status("FULL")
                        .address("ul. Testowa 2, Kraków")
                        .latitude(new BigDecimal("50.061430"))
                        .longitude(new BigDecimal("19.936580"))
                        .build(),
                DepositMachineResponseDTO.builder()
                        .id(3L)
                        .networkName("Zabka")
                        .status("OUT_OF_ORDER")
                        .address("ul. Wymyślona 3, Kraków")
                        .latitude(new BigDecimal("50.057390"))
                        .longitude(new BigDecimal("19.946120"))
                        .build()
        );
    }
}