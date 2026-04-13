package pl.isigmas.kaucjapp.deposit.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.deposit.DTO.DepositMachineResponseDTO;
import pl.isigmas.kaucjapp.deposit.DTO.OpeningHourDTO;
import pl.isigmas.kaucjapp.deposit.DTO.UpdateMachineDTO;
import pl.isigmas.kaucjapp.deposit.model.DepositMachine;
import pl.isigmas.kaucjapp.deposit.model.OpeningHourRecord;
import pl.isigmas.kaucjapp.deposit.repository.DepositMachineRepository;
import pl.isigmas.kaucjapp.deposit.repository.RetailNetworkRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

    @Transactional
    public void addNewMachine(DepositMachineResponseDTO depositMachineResponseDTO) {
        var depositMachine = new DepositMachine();
        var retail = retailNetworkRepository.findByName(depositMachineResponseDTO.getNetworkName());

        depositMachine.setRetailNetwork(retail);
        depositMachine.setLatitude(depositMachineResponseDTO.getLatitude());
        depositMachine.setLongitude(depositMachineResponseDTO.getLongitude());
        depositMachine.setAddress(depositMachineResponseDTO.getAddress());

        List<OpeningHourRecord> openingHourRecords = new ArrayList<>();

        for(var day : depositMachineResponseDTO.getOpeningHours()){
            OpeningHourRecord record = new OpeningHourRecord();
            record.setDepositMachine(depositMachine);
            record.setOpenTime(day.getOpenTime());
            record.setCloseTime(day.getCloseTime());
            record.setDayOfWeek(day.getDayOfWeek());

            depositMachine.addOpeningHour(record);
        }

        depositMachine.setOpeningHours(openingHourRecords);

        depositMachineRepository.save(depositMachine);
    }

    @Transactional
    public void updateMachine(Long id,UpdateMachineDTO dto) {
        DepositMachine depositMachine = depositMachineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Machine with such id not found"));

        if(dto.getNetworkName() != null){
            var retail = retailNetworkRepository.findByName(dto.getNetworkName());

            depositMachine.setRetailNetwork(retail);
        }

        if (dto.getStatus() != null) depositMachine.setStatus(dto.getStatus());
        if (dto.getAddress() != null) depositMachine.setAddress(dto.getAddress());
        if (dto.getLatitude() != null) depositMachine.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) depositMachine.setLongitude(dto.getLongitude());

        if (dto.getOpeningHours() != null) {
            for (OpeningHourDTO hourDto : dto.getOpeningHours()) {
                Optional<OpeningHourRecord> existingHour = depositMachine.getHourByDay(hourDto.getDayOfWeek());

                if (existingHour.isPresent()) {
                    OpeningHourRecord recordToUpdate = existingHour.get();
                    recordToUpdate.setOpenTime(hourDto.getOpenTime());
                    recordToUpdate.setCloseTime(hourDto.getCloseTime());
                } else {
                    OpeningHourRecord newRecord = new OpeningHourRecord();
                    newRecord.setDayOfWeek(hourDto.getDayOfWeek());
                    newRecord.setOpenTime(hourDto.getOpenTime());
                    newRecord.setCloseTime(hourDto.getCloseTime());

                    depositMachine.addOpeningHour(newRecord);
                }
            }
        }

    }


    public void delete(Long id) {
        DepositMachine depositMachine = depositMachineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Machine with such id not found"));

        depositMachineRepository.delete(depositMachine);
    }

}