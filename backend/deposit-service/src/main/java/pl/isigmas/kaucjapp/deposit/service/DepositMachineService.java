package pl.isigmas.kaucjapp.deposit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineResponseDTO;
import pl.isigmas.kaucjapp.deposit.DTO.OpeningHourDTO;
import pl.isigmas.kaucjapp.deposit.model.DepositMachine;
import pl.isigmas.kaucjapp.deposit.model.OpeningHourRecord;
import pl.isigmas.kaucjapp.deposit.repository.DepositMachineRepository;
import pl.isigmas.kaucjapp.deposit.repository.RetailNetworkRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepositMachineService {

    private final DepositMachineRepository depositMachineRepository;
    private final RetailNetworkRepository retailNetworkRepository;

    @Transactional(readOnly = true)
    public List<DepositMachineResponseDTO> getAll() {
        return depositMachineRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private DepositMachineResponseDTO mapToResponseDTO(DepositMachine depositMachine) {
        List<OpeningHourDTO> openingHourDTOs = depositMachine.getItems().stream()
                .map(hourRecord -> OpeningHourDTO.builder()
                        .dayOfWeek(hourRecord.getDayOfWeek())
                        .openTime(hourRecord.getOpenTime())
                        .closeTime(hourRecord.getCloseTime())
                        .build())
                .collect(Collectors.toList());

        return DepositMachineResponseDTO.builder()
                .networkName(depositMachine.getRetailNetwork() != null ? depositMachine.getRetailNetwork().getName() : null)
                .status(depositMachine.getStatus())
                .address(depositMachine.getAddress())
                .latitude(depositMachine.getLatitude())
                .longitude(depositMachine.getLongitude())
                .openingHours(openingHourDTOs)
                .build();
    }

    public void addNewMachine(DepositMachineResponseDTO depositMachineResponseDTO) {
        var depositMachine = new DepositMachine();
        var retail = retailNetworkRepository.findBy(depositMachineResponseDTO.getNetworkName());

        depositMachine.setRetailNetwork(retail);
        depositMachine.setLatitude(depositMachineResponseDTO.getLatitude());
        depositMachine.setLongitude(depositMachineResponseDTO.getLongitude());
        depositMachine.setAddress(depositMachineResponseDTO.getAddress());

        List<OpeningHourRecord> openingHourRecords = new ArrayList<>();

        for(var day : depositMachineResponseDTO.getOpeningHours()){
            OpeningHourRecord openingHourRecord = new OpeningHourRecord();
            openingHourRecord.setDepositMachine(depositMachine);
            openingHourRecord.setOpenTime(day.getOpenTime());
            openingHourRecord.setCloseTime(day.getCloseTime());
            openingHourRecord.setDayOfWeek(day.getDayOfWeek());

            openingHourRecords.add(openingHourRecord);
        }

        depositMachine.setOpeningHours(openingHourRecords);
    }

}