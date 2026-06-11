package pl.isigmas.kaucjapp.deposit.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.deposit.DTO.*;
import pl.isigmas.kaucjapp.deposit.exception.DepositMachineNotFoundException;
import pl.isigmas.kaucjapp.deposit.exception.DepositValidationException;
import pl.isigmas.kaucjapp.deposit.exception.RatingNotFoundException;
import pl.isigmas.kaucjapp.deposit.exception.RetailNetworkNotFoundException;
import pl.isigmas.kaucjapp.deposit.model.DepositMachine;
import pl.isigmas.kaucjapp.deposit.model.OpeningHourRecord;
import pl.isigmas.kaucjapp.deposit.model.Rating;
import pl.isigmas.kaucjapp.deposit.repository.DepositMachineRepository;
import pl.isigmas.kaucjapp.deposit.repository.RatingRepository;
import pl.isigmas.kaucjapp.deposit.repository.RetailNetworkRepository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepositMachineService {

    private final DepositMachineRepository depositMachineRepository;
    private final RetailNetworkRepository retailNetworkRepository;
    private final RatingRepository ratingRepository;
    private final Logger logger;

    @Transactional(readOnly = true)
    public List<DepositMachineResponseDTO> getAll() {
        List<DepositMachine> machines = depositMachineRepository.findAll();
        Map<Long, Rating> ratingByMachineId = ratingsByMachineId(machines.stream().map(DepositMachine::getId).toList());

        return machines.stream()
                .map(m -> mapToResponseDTO(m, ratingByMachineId.get(m.getId())))
                .toList();
    }

    private DepositMachineResponseDTO mapToResponseDTO(DepositMachine depositMachine, Rating rating) {
        List<OpeningHourDTO> openingHourDTOs = depositMachine.getItems().stream()
                .map(hourRecord -> OpeningHourDTO.builder()
                        .isClosed(hourRecord.getIsClosed())
                        .dayOfWeek(hourRecord.getDayOfWeek())
                        .openTime(hourRecord.getOpenTime())
                        .closeTime(hourRecord.getCloseTime())
                        .build())
                .collect(Collectors.toList());

        if (rating == null) {
            log.warn("Rating not found for deposit machine ID: {}", depositMachine.getId());
            logger.warn("Rating not found for deposit machine ID: %d".formatted(depositMachine.getId()));
            throw new RatingNotFoundException(depositMachine.getId());
        }

        return DepositMachineResponseDTO.builder()
                .id(depositMachine.getId())
                .networkName(depositMachine.getRetailNetwork() != null ? depositMachine.getRetailNetwork().getName() : null)
                .status(depositMachine.getStatus())
                .address(depositMachine.getAddress())
                .latitude(depositMachine.getLatitude())
                .longitude(depositMachine.getLongitude())
                .openingHours(openingHourDTOs)
                .avgScore(rating.getAvgScore())
                .feedbackCount(rating.getFeedbackCount())
                .build();
    }

    @Transactional
    public void addNewMachine(DepositMachineRequestDTO depositMachineRequestDTO) {
        var depositMachine = new DepositMachine();
        var retail = retailNetworkRepository.findByName(depositMachineRequestDTO.getNetworkName())
                .orElseThrow(() -> {
                    log.warn("Retail network not found: {}", depositMachineRequestDTO.getNetworkName());
                    logger.warn("Retail network not found: %s".formatted(depositMachineRequestDTO.getNetworkName()));
                    return new RetailNetworkNotFoundException(depositMachineRequestDTO.getNetworkName());
                });

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

        depositMachineRepository.saveAndFlush(depositMachine);

        Rating rating = new Rating();
        rating.setDepositMachineId(depositMachine.getId());
        rating.setAvgScore(BigDecimal.ZERO);
        rating.setFeedbackCount(0);
        ratingRepository.save(rating);

        log.info("Deposit machine created, ID: {} at {}", depositMachine.getId(), depositMachineRequestDTO.getAddress());
        logger.important("Deposit machine created, ID: %d at %s".formatted(
                depositMachine.getId(), depositMachineRequestDTO.getAddress()));
    }

    @Transactional
    public void updateMachine(Long id, UpdateMachineDTO dto) {
        DepositMachine depositMachine = depositMachineRepository.findWithOpeningHoursById(id)
                .orElseThrow(() -> {
                    log.warn("Deposit machine not found, ID: {}", id);
                    logger.warn("Deposit machine not found, ID: %d".formatted(id));
                    return new DepositMachineNotFoundException(id);
                });

        if (dto.getNetworkName() != null) {
            if (dto.getNetworkName().isBlank()) {
                log.warn("Deposit machine update rejected, blank networkName for ID: {}", id);
                logger.warn("Deposit machine update rejected, blank networkName for ID: %d".formatted(id));
                throw new DepositValidationException("networkName must not be blank when provided");
            }
            var retail = retailNetworkRepository.findByName(dto.getNetworkName())
                    .orElseThrow(() -> {
                        log.warn("Retail network not found: {}", dto.getNetworkName());
                        logger.warn("Retail network not found: %s".formatted(dto.getNetworkName()));
                        return new RetailNetworkNotFoundException(dto.getNetworkName());
                    });

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

        log.info("Deposit machine updated, ID: {}", id);
        logger.info("Deposit machine updated, ID: %d".formatted(id));
    }

    @Transactional
    public void delete(Long id) {
        DepositMachine depositMachine = depositMachineRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Deposit machine not found, ID: {}", id);
                    logger.warn("Deposit machine not found, ID: %d".formatted(id));
                    return new DepositMachineNotFoundException(id);
                });

        ratingRepository.findById(id).ifPresent(ratingRepository::delete);
        depositMachineRepository.delete(depositMachine);

        log.info("Deposit machine deleted, ID: {}", id);
        logger.important("Deposit machine deleted, ID: %d".formatted(id));
    }

    @Transactional(readOnly = true)
    public List<DepositMachineResponseDTO> getDepositMachinesInArea(double swLat, double swLon, double neLat, double neLon) {
        List<Long> ids = depositMachineRepository.findIdsInBoundingBox(swLat, swLon, neLat, neLon);
        if (ids.isEmpty()) {
            return Collections.emptyList();
        }
        List<DepositMachine> machines = depositMachineRepository.findAllByIdInWithAssociations(ids);
        Map<Long, Rating> ratingByMachineId = ratingsByMachineId(ids);

        return machines.stream()
                .map(m -> mapToResponseDTO(m, ratingByMachineId.get(m.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public DepositMachineResponseDTO getDepositMachine(Long id) {
        DepositMachine depositMachine = depositMachineRepository.findWithOpeningHoursById(id)
                .orElseThrow(() -> {
                    log.warn("Deposit machine not found, ID: {}", id);
                    logger.warn("Deposit machine not found, ID: %d".formatted(id));
                    return new DepositMachineNotFoundException(id);
                });
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Rating not found for deposit machine ID: {}", id);
                    logger.warn("Rating not found for deposit machine ID: %d".formatted(id));
                    return new RatingNotFoundException(id);
                });
        return mapToResponseDTO(depositMachine, rating);
    }

    private Map<Long, Rating> ratingsByMachineId(Collection<Long> machineIds) {
        return ratingRepository.findByDepositMachineIdIn(machineIds).stream()
                .collect(Collectors.toMap(Rating::getDepositMachineId, Function.identity()));
    }

}
