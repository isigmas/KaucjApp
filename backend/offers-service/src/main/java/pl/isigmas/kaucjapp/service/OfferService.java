package pl.isigmas.kaucjapp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;
import pl.isigmas.kaucjapp.DTO.OfferDTO;
import pl.isigmas.kaucjapp.DTO.OfferResponseDTO;
import pl.isigmas.kaucjapp.model.*;
import pl.isigmas.kaucjapp.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final BottleTypeRepository bottleTypeRepository;

    @Transactional
    public Long create(Long creatorId, OfferDTO dto) {
        Offer offer = new Offer();
        offer.setCreatorId(creatorId);
        offer.setLatitude(dto.getLatitude());
        offer.setLongitude(dto.getLongitude());
        offer.setPickupAddress(dto.getPickupAddress());
        offer.setPickupInstructions(dto.getPickupInstructions());
        offer.setStatus(OfferStatus.OPEN);

        dto.getItems().forEach(itemDto -> {
            BottleType type = bottleTypeRepository.findById(itemDto.getBottleId())
                    .orElseThrow(() -> new EntityNotFoundException("Bottle type not found"));

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
    public void update(Long id, Long userId, OfferDTO dto) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Offer not found"));

        if (!offer.getCreatorId().equals(userId)) {
            throw new SecurityException("Only offer creator can update the offer");
        }

        if (offer.getStatus() != OfferStatus.OPEN) {
            throw new IllegalStateException("Only OPEN offers can be updated");
        }

        offer.setLatitude(dto.getLatitude());
        offer.setLongitude(dto.getLongitude());
        offer.setPickupAddress(dto.getPickupAddress());
        offer.setPickupInstructions(dto.getPickupInstructions());

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
                        .orElseThrow(() -> new EntityNotFoundException("Bottle type not found"));

                OfferItem newItem = new OfferItem();
                newItem.setQuantity(itemDto.getQuantity());
                newItem.setUnitPrice(itemDto.getUnitPrice());
                newItem.setRelations(offer, type);

                offer.addItem(newItem);
            }
        });
        existingItems.values().forEach(offer::removeItem);

        offerRepository.save(offer);
    }

    @Transactional(readOnly = true)
    public List<OfferResponseDTO> getAll() {
        return offerRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OfferResponseDTO getById(Long id) {
        return offerRepository.findById(id)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new EntityNotFoundException("Offer not found"));
    }

    @Transactional(readOnly = true)
    public List<OfferResponseDTO> getAllByCreatorId(Long userId) {
        return offerRepository.findByCreatorId(userId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OfferResponseDTO> getReservedOffersByUserId(Long userId) {
        return offerRepository.findByCollectorIdAndStatus(userId, OfferStatus.RESERVED).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private OfferResponseDTO mapToResponseDTO(Offer offer) {
        List<OfferResponseDTO.OfferItemResponseDTO> itemDTOs = offer.getItems().stream()
                .map(item -> {
                    BigDecimal statutoryFee = item.getBottleType().getDepositFee();
                    BigDecimal frontendFee = statutoryFee.subtract(item.getUnitPrice());

                    return OfferResponseDTO.OfferItemResponseDTO.builder()
                            .bottleId(item.getBottleType().getId())
                            .name(item.getBottleType().getName())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .depositFee(frontendFee)
                            .build();
                })
                .collect(Collectors.toList());

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
                .items(itemDTOs)
                .build();
    }

    @Transactional
    public void changeStatus(Long offerId, Long userId, String newStatus) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new EntityNotFoundException("Offer not found"));

        OfferStatus targetStatus;
        try {
            targetStatus = OfferStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid offer status: " + newStatus);
        }

        OfferStatus currentStatus = offer.getStatus();
        if (currentStatus == OfferStatus.COMPLETED || currentStatus == OfferStatus.CANCELED) {
            throw new IllegalStateException("Offer status can no longer be changed");
        }

        // Basic transition rules (keep minimal + explicit)
        if (currentStatus == OfferStatus.OPEN && targetStatus == OfferStatus.COMPLETED) {
            throw new IllegalStateException("Cannot complete an OPEN offer");
        }

        if (targetStatus == OfferStatus.RESERVED) {
            if (offer.getCreatorId().equals(userId)) {
                throw new SecurityException("You cannot reserve your own offer");
            }
            if (offer.getCollectorId() != null && !offer.getCollectorId().equals(userId)) {
                throw new IllegalStateException("Offer is already reserved by another user");
            }
            offer.setCollectorId(userId);
        }

        if (targetStatus == OfferStatus.OPEN) {
            if (currentStatus == OfferStatus.RESERVED
                    && offer.getCollectorId() != null
                    && !offer.getCollectorId().equals(userId)) {
                throw new SecurityException("Only current collector can unreserve the offer");
            }
            offer.setCollectorId(null);
        }

        if (targetStatus == OfferStatus.COMPLETED) {
            if (currentStatus != OfferStatus.RESERVED) {
                throw new IllegalStateException("Only RESERVED offers can be completed");
            }
            if (offer.getCollectorId() == null || !offer.getCollectorId().equals(userId)) {
                throw new SecurityException("Only current collector can complete the offer");
            }
            offer.setTimeCompleted(LocalDateTime.now());
        }

        if (targetStatus == OfferStatus.CANCELED) {
            if (!offer.getCreatorId().equals(userId)) {
                throw new SecurityException("Only offer creator can cancel the offer");
            }
        }

        offer.setStatus(targetStatus);
        offerRepository.save(offer);
    }

    @Transactional
    public void remove(Long offerId, Long userId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new EntityNotFoundException("Offer not found"));

        if (!offer.getCreatorId().equals(userId)) {
            throw new SecurityException("Only offer creator can delete the offer");
        }

        offerRepository.delete(offer);
    }
}