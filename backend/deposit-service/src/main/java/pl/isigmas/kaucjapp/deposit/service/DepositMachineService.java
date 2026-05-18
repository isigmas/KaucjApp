package pl.isigmas.kaucjapp.deposit.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.deposit.DTO.*;
import pl.isigmas.kaucjapp.deposit.exception.DepositMachineNotFoundException;
import pl.isigmas.kaucjapp.deposit.exception.DepositValidationException;
import pl.isigmas.kaucjapp.deposit.exception.RetailNetworkNotFoundException;
import pl.isigmas.kaucjapp.deposit.model.DepositMachine;
import pl.isigmas.kaucjapp.deposit.model.OpeningHourRecord;
import pl.isigmas.kaucjapp.deposit.model.Rating;
import pl.isigmas.kaucjapp.deposit.repository.DepositMachineRepository;
import pl.isigmas.kaucjapp.deposit.repository.RetailNetworkRepository;

import java.util.Collections;
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
                        .isClosed(hourRecord.getIsClosed())
                        .dayOfWeek(hourRecord.getDayOfWeek())
                        .openTime(hourRecord.getOpenTime())
                        .closeTime(hourRecord.getCloseTime())
                        .build())
                .collect(Collectors.toList());

        return DepositMachineResponseDTO.builder()
                .id(depositMachine.getId())
                .networkName(depositMachine.getRetailNetwork() != null ? depositMachine.getRetailNetwork().getName() : null)
                .status(depositMachine.getStatus())
                .address(depositMachine.getAddress())
                .latitude(depositMachine.getLatitude())
                .longitude(depositMachine.getLongitude())
                .openingHours(openingHourDTOs)
                .build();
    }

    @Transactional
    public void addNewMachine(DepositMachineRequestDTO depositMachineRequestDTO) {
        var depositMachine = new DepositMachine();
        var retail = retailNetworkRepository.findByName(depositMachineRequestDTO.getNetworkName())
                .orElseThrow(() -> new RetailNetworkNotFoundException(depositMachineRequestDTO.getNetworkName()));

        depositMachine.setRetailNetwork(retail);
        depositMachine.setLatitude(depositMachineRequestDTO.getLatitude());
        depositMachine.setLongitude(depositMachineRequestDTO.getLongitude());
        depositMachine.setAddress(depositMachineRequestDTO.getAddress());

        for (var day : depositMachineRequestDTO.getOpeningHours()) {
            OpeningHourRecord record = new OpeningHourRecord();
            record.setIsClosed(Boolean.TRUE.equals(day.getIsClosed()));
            record.setOpenTime(day.getOpenTime());
            record.setCloseTime(day.getCloseTime());
            record.setDayOfWeek(day.getDayOfWeek());

            depositMachine.addOpeningHour(record);
        }

        depositMachineRepository.save(depositMachine);
    }

    @Transactional
    public void updateMachine(Long id, UpdateMachineDTO dto) {
        DepositMachine depositMachine = depositMachineRepository.findWithOpeningHoursById(id)
                .orElseThrow(() -> new DepositMachineNotFoundException(id));

        if (dto.getNetworkName() != null) {
            if (dto.getNetworkName().isBlank()) {
                throw new DepositValidationException("networkName must not be blank when provided");
            }
            var retail = retailNetworkRepository.findByName(dto.getNetworkName())
                    .orElseThrow(() -> new RetailNetworkNotFoundException(dto.getNetworkName()));

            depositMachine.setRetailNetwork(retail);
        }

        if (dto.getStatus() != null) {
            depositMachine.setStatus(dto.getStatus());
        }
        if (dto.getAddress() != null) {
            depositMachine.setAddress(dto.getAddress());
        }
        if (dto.getLatitude() != null) {
            depositMachine.setLatitude(dto.getLatitude());
        }
        if (dto.getLongitude() != null) {
            depositMachine.setLongitude(dto.getLongitude());
        }

        if (dto.getOpeningHours() != null) {
            for (OpeningHourDTO hourDto : dto.getOpeningHours()) {
                Optional<OpeningHourRecord> existingHour = depositMachine.getHourByDay(hourDto.getDayOfWeek());

                if (existingHour.isPresent()) {
                    OpeningHourRecord recordToUpdate = existingHour.get();
                    if (hourDto.getIsClosed() != null) {
                        recordToUpdate.setIsClosed(hourDto.getIsClosed());
                    }
                    recordToUpdate.setOpenTime(hourDto.getOpenTime());
                    recordToUpdate.setCloseTime(hourDto.getCloseTime());
                } else {
                    OpeningHourRecord newRecord = new OpeningHourRecord();
                    newRecord.setIsClosed(Boolean.TRUE.equals(hourDto.getIsClosed()));
                    newRecord.setDayOfWeek(hourDto.getDayOfWeek());
                    newRecord.setOpenTime(hourDto.getOpenTime());
                    newRecord.setCloseTime(hourDto.getCloseTime());

                    depositMachine.addOpeningHour(newRecord);
                }
            }
        }
    }

    @Transactional
    public void delete(Long id) {
        DepositMachine depositMachine = depositMachineRepository.findById(id)
                .orElseThrow(() -> new DepositMachineNotFoundException(id));

        depositMachineRepository.delete(depositMachine);
    }

    @Transactional(readOnly = true)
    public List<DepositMachineResponseDTO> getDepositMachinesInArea(double swLat, double swLon, double neLat, double neLon) {
        List<Long> ids = depositMachineRepository.findIdsInBoundingBox(swLat, swLon, neLat, neLon);
        if (ids.isEmpty()) {
            return Collections.emptyList();
        }
        return depositMachineRepository.findAllByIdInWithAssociations(ids).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepositMachineResponseDTO getDepositMachine(Long id) {
        DepositMachine depositMachine = depositMachineRepository.findById(id)
                                        .orElseThrow(() -> new DepositMachineNotFoundException(id));
        return mapToResponseDTO(depositMachine);
    }


}
