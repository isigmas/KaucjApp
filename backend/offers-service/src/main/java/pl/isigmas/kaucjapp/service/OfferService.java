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
    public Long create(OfferDTO dto) {
        Offer offer = new Offer();
        offer.setCreatorId(dto.getCreatorId());
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
    public void update(Long id, OfferDTO dto) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Offer not found"));

        if (!offer.getCreatorId().equals(dto.getCreatorId())) {
            throw new EntityNotFoundException("Offer not found or access denied");
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
    public boolean changeStatus(Long offerId, Long userId, String newStatus) {
        return offerRepository.findById(offerId).map(offer -> {
            OfferStatus status;
            try {
                status = OfferStatus.valueOf(newStatus.toUpperCase());
            } catch (IllegalArgumentException e) {
                return false;
            }

            if (status == OfferStatus.RESERVED && offer.getCreatorId().equals(userId)) {
                log.warn("User {} tried to reserve their own offer {}", userId, offerId);
                return false;
            }

            offer.setStatus(status);

            if (status == OfferStatus.RESERVED) {
                offer.setCollectorId(userId);
            } else if (status == OfferStatus.COMPLETED) {
                offer.setTimeCompleted(LocalDateTime.now());
            } else if (status == OfferStatus.OPEN) {
                offer.setCollectorId(null);
            }

            offerRepository.save(offer);
            return true;
        }).orElse(false);
    }

    @Transactional
    public boolean remove(Long offerId) {
        if (offerRepository.existsById(offerId)) {
            offerRepository.deleteById(offerId);
            return true;
        }
        return false;
    }
}