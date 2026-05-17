package pl.isigmas.kaucjapp.offers.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.offers.DTO.*;
import pl.isigmas.kaucjapp.offers.exception.BottleTypeNotFoundException;
import pl.isigmas.kaucjapp.offers.exception.OfferAlreadyClaimedException;
import pl.isigmas.kaucjapp.offers.exception.OfferForbiddenException;
import pl.isigmas.kaucjapp.offers.exception.OfferNotFoundException;
import pl.isigmas.kaucjapp.offers.exception.OfferStateException;
import pl.isigmas.kaucjapp.offers.exception.OfferValidationException;
import pl.isigmas.kaucjapp.offers.model.*;
import pl.isigmas.kaucjapp.offers.publisher.OfferKafkaPublisher;
import pl.isigmas.kaucjapp.offers.repository.*;

import java.math.BigDecimal;
import java.nio.file.AccessDeniedException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OfferService {

    private static final String PLASTIC_TYPE = "plastic";
    private static final String CAN_TYPE = "can";

    private final OfferRepository offerRepository;
    private final BottleTypeRepository bottleTypeRepository;
    private final ComplaintRepository complaintRepository;
    private final GeoValidationService geoValidationService;
    private final OfferKafkaPublisher offerKafkaPublisher;

    @Transactional
    public Long create(Long creatorId, OfferDTO dto) {
        validateLocation(dto.getLatitude(), dto.getLongitude());
        Offer offer = new Offer();
        offer.setCreatorId(creatorId);
        offer.setLatitude(dto.getLatitude());
        offer.setLongitude(dto.getLongitude());
        offer.setPickupAddress(dto.getPickupAddress());
        offer.setPickupInstructions(dto.getPickupInstructions());
        offer.setStatus(OfferStatus.OPEN);


        dto.getItems().forEach(itemDto -> {
            BottleType type = bottleTypeRepository.findById(itemDto.getBottleId())
                    .orElseThrow(() -> new BottleTypeNotFoundException(itemDto.getBottleId()));

            OfferItem item = new OfferItem();
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(itemDto.getUnitPrice());

            item.setRelations(offer, type);

            offer.addItem(item);
        });

        Offer savedOffer = offerRepository.save(offer);
        return savedOffer.getId();
    }

    @Transactional
    public void update(Long id, Long userId, UpdateOfferDTO dto) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new OfferNotFoundException(id));

        if (!offer.getCreatorId().equals(userId)) {
            throw new OfferForbiddenException("Only offer creator can update the offer");
        }

        if (offer.getStatus() != OfferStatus.OPEN) {
            throw new OfferStateException("Only OPEN offers can be updated");
        }

        BigDecimal updatedLatitude = dto.getLatitude() != null ? dto.getLatitude() : offer.getLatitude();
        BigDecimal updatedLongitude = dto.getLongitude() != null ? dto.getLongitude() : offer.getLongitude();
        validateLocation(updatedLatitude, updatedLongitude);

        if (dto.getLongitude() != null) {
            offer.setLongitude(dto.getLongitude());
        }
        if (dto.getLatitude() != null) {
            offer.setLatitude(dto.getLatitude());
        }
        if (dto.getPickupAddress() != null) {
            offer.setPickupAddress(dto.getPickupAddress());
        }
        if (dto.getPickupInstructions() != null) {
            offer.setPickupInstructions(dto.getPickupInstructions());
        }

        if (dto.getItems() != null) {
            Map<Long, OfferItem> existingItems = offer.getItems().stream()
                    .collect(Collectors.toMap(
                            item -> item.getBottleType().getId(),
                            item -> item
                    ));

            dto.getItems().forEach(itemDto -> {
                OfferItem existingItem = existingItems.remove(itemDto.getBottleId());

                if (existingItem != null) {
                    existingItem.setQuantity(itemDto.getQuantity());
                    existingItem.setUnitPrice(itemDto.getUnitPrice());
                } else {
                    BottleType type = bottleTypeRepository.findById(itemDto.getBottleId())
                            .orElseThrow(() -> new BottleTypeNotFoundException(itemDto.getBottleId()));

                    OfferItem newItem = new OfferItem();
                    newItem.setQuantity(itemDto.getQuantity());
                    newItem.setUnitPrice(itemDto.getUnitPrice());
                    newItem.setRelations(offer, type);

                    offer.addItem(newItem);
                }
            });
            existingItems.values().forEach(offer::removeItem);
        }
    }

    @Transactional(readOnly = true)
    public List<OfferResponseDTO> getAll() {
        return offerRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OfferResponseDTO> getAllByCreatorId(Long userId) {
        List<OfferStatus> statuses = List.of(
                OfferStatus.OPEN,
                OfferStatus.RESERVED,
                OfferStatus.PENDING_CONFIRMATION,
                OfferStatus.COMPLAINT
        );
        return offerRepository.findByCreatorIdAndStatusIn(userId, statuses).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OfferResponseDTO> getReservedOffersByUserId(Long userId) {
        List<OfferStatus> statuses = List.of(
                OfferStatus.RESERVED,
                OfferStatus.PENDING_CONFIRMATION,
                OfferStatus.COMPLAINT
        );
        return offerRepository.findByCollectorIdAndStatusIn(userId, statuses).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OfferResponseDTO> getOffersInArea(double swLat, double swLon, double neLat, double neLon) {
        return offerRepository.findOpenOffersInBoundingBox(swLat, swLon, neLat, neLon).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OfferResponseDTO> getMyOffersHistory(Long userId) {
        List<OfferStatus> statuses = List.of(
                OfferStatus.COMPLETED,
                OfferStatus.CANCELED
        );
        return offerRepository.findByCreatorIdAndStatusIn(userId, statuses).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OfferResponseDTO> getMyCollectedOffersHistory(Long userId) {
        List<OfferStatus> statuses = List.of(
                OfferStatus.COMPLETED
        );
        return offerRepository.findByCollectorIdAndStatusIn(userId, statuses).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }


    private OfferResponseDTO mapToResponseDTO(Offer offer) {
        int plasticQty = 0;
        int canQty = 0;
        BigDecimal plasticPrice = null;
        BigDecimal canPrice = null;
        BigDecimal totalPrize = BigDecimal.ZERO;
        BigDecimal totalIncome = BigDecimal.ZERO;
        int totalQty = 0;

        for (OfferItem item : offer.getItems()) {
            String typeName = item.getBottleType().getName();
            int q = item.getQuantity();
            BigDecimal unit = item.getUnitPrice();
            BigDecimal statutory = item.getBottleType().getDepositFee();
            BigDecimal margin = statutory.subtract(unit);

            totalQty += q;
            totalPrize = totalPrize.add(unit.multiply(BigDecimal.valueOf(q)));
            totalIncome = totalIncome.add(margin.multiply(BigDecimal.valueOf(q)));

            if (PLASTIC_TYPE.equalsIgnoreCase(typeName)) {
                plasticQty = q;
                plasticPrice = unit;
            } else if (CAN_TYPE.equalsIgnoreCase(typeName)) {
                canQty = q;
                canPrice = unit;
            }
        }

        return OfferResponseDTO.builder()
                .offerId(offer.getId())
                .creatorId(offer.getCreatorId())
                .collectorId(offer.getCollectorId())
                .status(offer.getStatus().name())
                .latitude(offer.getLatitude())
                .longitude(offer.getLongitude())
                .pickupAddress(offer.getPickupAddress())
                .pickupInstructions(offer.getPickupInstructions())
                .createdAt(offer.getTimeCreated())
                .updatedAt(offer.getUpdatedAt())
                .reservedAt(offer.getReservedAt())
                .reservedTo(offer.getReservedTo())
                .creatorConfirmed(offer.getCreatorConfirmed())
                .collectorConfirmed(offer.getCollectorConfirmed())
                .confirmationDeadline(offer.getConfirmationDeadline())
                .plasticQuantity(plasticQty)
                .canQuantity(canQty)
                .totalQuantity(totalQty)
                .totalPrize(totalPrize)
                .totalIncome(totalIncome)
                .plasticPrice(plasticPrice)
                .canPrice(canPrice)
                .build();
    }

    @Transactional
    public void changeStatus(Long offerId, Long userId, String newStatus) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException(offerId));

        OfferStatus targetStatus;
        try {
            targetStatus = OfferStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new OfferValidationException("Invalid offer status: " + newStatus);
        }

        OfferStatus currentStatus = offer.getStatus();
        if (currentStatus == OfferStatus.COMPLETED || currentStatus == OfferStatus.CANCELED) {
            throw new OfferStateException("Offer status can no longer be changed");
        }

        if (currentStatus == OfferStatus.OPEN && targetStatus == OfferStatus.COMPLETED) {
            throw new OfferStateException("Cannot complete an OPEN offer");
        }

        if (targetStatus == OfferStatus.RESERVED) {
            if (offer.getCreatorId().equals(userId)) {
                throw new OfferForbiddenException("You cannot reserve your own offer");
            }
            if (offer.getCollectorId() != null && !offer.getCollectorId().equals(userId)) {
                throw new OfferAlreadyClaimedException("Offer is already reserved by another user");
            }
            if (currentStatus != OfferStatus.OPEN) {
                throw new OfferAlreadyClaimedException("Only OPEN offers can be reserved");
            }
            offer.setCollectorId(userId);
            offer.setReservedAt(Instant.now());
            offer.setReservedTo(Instant.now().plus(Duration.ofHours(2)));
            offer.setCreatorConfirmed(false);
            offer.setCollectorConfirmed(false);
            offer.setConfirmationDeadline(null);
        }

        if (targetStatus == OfferStatus.OPEN) {
            if (currentStatus == OfferStatus.RESERVED
                    && offer.getCollectorId() != null
                    && !offer.getCollectorId().equals(userId)) {
                throw new OfferForbiddenException("Only current collector can unreserve the offer");
            }
            offer.setCollectorId(null);
            offer.setReservedAt(null);
            offer.setReservedTo(null);
            offer.setCreatorConfirmed(false);
            offer.setCollectorConfirmed(false);
            offer.setConfirmationDeadline(null);
        }

        if (targetStatus == OfferStatus.COMPLETED) {
            throw new OfferForbiddenException("Offer complete only by two way completing");
        }

        if (targetStatus == OfferStatus.CANCELED) {
            if (!offer.getCreatorId().equals(userId)) {
                throw new OfferForbiddenException("Only offer creator can cancel the offer");
            }
        }

        if(targetStatus == OfferStatus.PENDING_CONFIRMATION){
            throw new OfferForbiddenException("Offer confirmation can be done only by confirm - cannot be done here");
        }

        if (targetStatus == OfferStatus.COMPLAINT) {
            throw new OfferForbiddenException("Offer complaint can be done only by specific endpoint with a message");
        }

        offer.setStatus(targetStatus);
    }

    @Transactional
    public void confirmOffer(Long offerId, Long currentUserId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException(offerId));

        if (offer.getStatus() != OfferStatus.RESERVED && offer.getStatus() != OfferStatus.PENDING_CONFIRMATION) {
            throw new OfferForbiddenException("You can only confirm RESERVED or PENDING offers");
        }

        if (currentUserId.equals(offer.getCreatorId())) {
            offer.setCreatorConfirmed(true);
        } else if (currentUserId.equals(offer.getCollectorId())) {
            offer.setCollectorConfirmed(true);
        } else {
            throw new OfferForbiddenException("You are not part of this offer");
        }

        if (Boolean.TRUE.equals(offer.getCreatorConfirmed()) && Boolean.TRUE.equals(offer.getCollectorConfirmed())) {
            completeOfferAndPublish(offer, Instant.now());
        } else if (offer.getStatus() == OfferStatus.RESERVED) {
            offer.setStatus(OfferStatus.PENDING_CONFIRMATION);
            offer.setConfirmationDeadline(Instant.now().plus(Duration.ofHours(24)));
        }

        offerRepository.save(offer);
    }

    /**
     * Completes offers whose confirmation window expired without mutual confirm (same stats semantics as a completed deal).
     * Loads items so Kafka payloads match {@link #confirmOffer}.
     */
    @Transactional
    public int completeExpiredPendingOffers(Instant now) {
        List<Offer> expired = offerRepository.findAllPendingOffersPastDeadline(OfferStatus.PENDING_CONFIRMATION, now);
        for (Offer offer : expired) {
            offer.setCreatorConfirmed(true);
            offer.setCollectorConfirmed(true);
            completeOfferAndPublish(offer, now);
            offerRepository.save(offer);
        }
        return expired.size();
    }

    private void completeOfferAndPublish(Offer offer, Instant completedAt) {
        offer.setStatus(OfferStatus.COMPLETED);
        offer.setConfirmationDeadline(null);
        offer.setTimeCompleted(completedAt);
        offerKafkaPublisher.sendOfferCompleted(buildOfferCompletedEvent(offer));
    }

    private OfferCompletedEventDTO buildOfferCompletedEvent(Offer offer) {
        int plasticQty = 0;
        int canQty = 0;
        for (OfferItem item : offer.getItems()) {
            String typeName = item.getBottleType().getName();
            if (PLASTIC_TYPE.equalsIgnoreCase(typeName)) {
                plasticQty += item.getQuantity();
            } else if (CAN_TYPE.equalsIgnoreCase(typeName)) {
                canQty += item.getQuantity();
            }
        }
        return OfferCompletedEventDTO.builder()
                .offerId(offer.getId())
                .creatorId(offer.getCreatorId())
                .collectorId(offer.getCollectorId())
                .plasticQuantity(plasticQty)
                .canQuantity(canQty)
                .build();
    }
    @Transactional
    public void remove(Long offerId, Long userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException(offerId));

        if (!offer.getCreatorId().equals(userId)) {
            throw new OfferForbiddenException("Only offer creator can delete the offer");
        }

        offerRepository.delete(offer);
    }

    private void validateLocation(BigDecimal lat, BigDecimal lon) {
        double latD = lat.doubleValue();
        double lonD = lon.doubleValue();

        if (!geoValidationService.isInPoland(latD, lonD)) {
            throw new OfferValidationException("Offer can only be created in Poland");
        }
    }

    @Transactional
    public void addComplaint(Long complainantId, Long offerId, ComplaintDTO complaint) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException(offerId));

        OfferStatus currentStatus = offer.getStatus();

        if (!Objects.equals(offer.getCreatorId(), complainantId)
                && !Objects.equals(offer.getCollectorId(), complainantId)) {
            throw new OfferForbiddenException("Only offer creator or collector can make the complaint");
        }

        if (currentStatus != OfferStatus.RESERVED && currentStatus != OfferStatus.PENDING_CONFIRMATION && currentStatus != OfferStatus.COMPLAINT) {
            throw new OfferStateException("Only RESERVED or PENDING_CONFIRMATION or already COMPLAINT offers can be complaint");
        }

        offer.setConfirmationDeadline(null);
        offer.setStatus(OfferStatus.COMPLAINT);

        OfferComplaint offerComplaint = new OfferComplaint();
        offerComplaint.setOffer(offer);
        if (Objects.equals(complainantId, offer.getCollectorId())) {
            offerComplaint.setComplainant(Complainant.COLLECTOR);
        }
        else {
            offerComplaint.setComplainant(Complainant.CREATOR);
        }
        offerComplaint.setComplaintReason(complaint.getComplaintReason());
        offerComplaint.setMessage(complaint.getMessage());

        complaintRepository.save(offerComplaint);
    }


    @Transactional(readOnly = true)
    public List<ComplaintResponseDTO> getAllComplaints() {
        return complaintRepository.findAllByOrderByIdDesc().stream()
                .map(this::mapToComplaintResponseDTO)
                .collect(Collectors.toList());
    }

    private ComplaintResponseDTO mapToComplaintResponseDTO(OfferComplaint complaint) {
        return ComplaintResponseDTO.builder()
                .complaintId(complaint.getId())
                .offerId(complaint.getOffer().getId())
                .complainant(complaint.getComplainant())
                .complaintReason(complaint.getComplaintReason())
                .message(complaint.getMessage())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponseDTO> getMyComplaintsForOffer(Long offerId, Long userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException(offerId));

        Complainant userRole;
        if (userId.equals(offer.getCreatorId())) {
            userRole = Complainant.CREATOR;
        } else if (userId.equals(offer.getCollectorId())) {
            userRole = Complainant.COLLECTOR;
        } else {
            throw new OfferForbiddenException("You are not a part of this offer");
        }

        return complaintRepository.findAllByOffer_IdAndComplainantOrderByIdDesc(offerId, userRole).stream()
                .map(this::mapToComplaintResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OfferResponseDTO getOffer(Long offerId, Long userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException(offerId));

        if (!Objects.equals(offer.getCreatorId(), userId)
                && !Objects.equals(offer.getCollectorId(), userId)) {
            throw new OfferForbiddenException("Only offer creator or collector can get offer");
        }

        return mapToResponseDTO(offer);
    }
}