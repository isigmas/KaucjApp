package pl.isigmas.kaucjapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import pl.isigmas.kaucjapp.DTO.OfferDTO;
import pl.isigmas.kaucjapp.model.*;
import pl.isigmas.kaucjapp.repository.*;
import pl.isigmas.kaucjapp.DTO.OfferResponseDTO;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final UserRepository userRepository;
    private final BottlePriceRepository bottlePriceRepository;

    @Transactional
    public Long create(OfferDTO dto) {
        User creator = userRepository.findById(dto.getCreatorId()).orElse(null);

        if (creator == null) {
            return null;
        }

        Offer offer = new Offer();
        offer.setCreator(creator);

        OfferInfo info = new OfferInfo();
        info.setOffer(offer);
        info.setPickupAddress(dto.getPickupAddress());
        info.setPickupInstructions(dto.getPickupInstructions());
        info.setLatitude(dto.getLatitude());
        info.setLongitude(dto.getLongitude());
        info.setStatus(OfferStatus.OPEN);
        offer.setInfo(info);

        List<OfferCount> counts = new ArrayList<>();

        if (dto.getAQuantity() != null && dto.getAQuantity() > 0) {
            BottlePrice aPrice = BottlePrice.builder()
                    .price(dto.getAPrice())
                    .fee(dto.getAFee())
                    .build();
            OfferCount aCount = new OfferCount();
            aCount.setOffer(offer);
            aCount.setBottlePrice(aPrice);
            aCount.setQuantity(dto.getAQuantity());
            counts.add(aCount);
        }

        if (dto.getBQuantity() != null && dto.getBQuantity() > 0) {
            BottlePrice bPrice = BottlePrice.builder()
                    .price(dto.getBPrice())
                    .fee(dto.getBFee())
                    .build();
            OfferCount bCount = new OfferCount();
            bCount.setOffer(offer);
            bCount.setBottlePrice(bPrice);
            bCount.setQuantity(dto.getBQuantity());
            counts.add(bCount);
        }

        if (dto.getCQuantity() != null && dto.getCQuantity() > 0) {
            BottlePrice cPrice = BottlePrice.builder()
                    .price(dto.getCPrice())
                    .fee(dto.getCFee())
                    .build();
            OfferCount cCount = new OfferCount();
            cCount.setOffer(offer);
            cCount.setBottlePrice(cPrice);
            cCount.setQuantity(dto.getCQuantity());
            counts.add(cCount);
        }

        offer.setCounts(counts);

        Offer savedOffer = offerRepository.save(offer);
        return savedOffer.getId();
    }

    @Transactional
    public boolean update(Long offerId, OfferDTO dto) {
        return offerRepository.findById(offerId).map(offer -> {
            if (offer.getInfo() != null) {
                if (dto.getLatitude() != null)
                    offer.getInfo().setLatitude(dto.getLatitude());
                if (dto.getLongitude() != null)
                    offer.getInfo().setLongitude(dto.getLongitude());
                if (dto.getPickupAddress() != null)
                    offer.getInfo().setPickupAddress(dto.getPickupAddress());
                if (dto.getPickupInstructions() != null)
                    offer.getInfo().setPickupInstructions(dto.getPickupInstructions());
            }

            if (offer.getCounts() != null) {
                for (OfferCount count : offer.getCounts()) {
                    var bottlePrice = count.getBottlePrice();
                    if (bottlePrice == null)
                        continue;

                    if (dto.getAQuantity() != null) {
                        bottlePrice.setPrice(dto.getAPrice());
                        bottlePrice.setFee(dto.getAFee());
                        bottlePriceRepository.save(bottlePrice);
                        count.setQuantity(dto.getAQuantity());
                    } else if (dto.getBQuantity() != null) {
                        bottlePrice.setPrice(dto.getBPrice());
                        bottlePrice.setFee(dto.getBFee());
                        bottlePriceRepository.save(bottlePrice);
                        count.setQuantity(dto.getBQuantity());
                    } else if (dto.getCQuantity() != null) {
                        bottlePrice.setPrice(dto.getCPrice());
                        bottlePrice.setFee(dto.getCFee());
                        bottlePriceRepository.save(bottlePrice);
                        count.setQuantity(dto.getCQuantity());
                    }
                }
            }

            offerRepository.save(offer);
            return true;
        }).orElse(false);
    }

    public List<OfferResponseDTO> getAll() {
        return offerRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private OfferResponseDTO mapToResponseDTO(Offer offer) {
        OfferResponseDTO.UserDTO userDTO = null;
        if (offer.getCreator() != null) {
            userDTO = OfferResponseDTO.UserDTO.builder()
                    .userId(offer.getCreator().getId())
                    .username(offer.getCreator().getUsername())
                    .build();
        }

        List<OfferResponseDTO.ItemDTO> itemDTOs = new ArrayList<>();
        if (offer.getCounts() != null) {
            itemDTOs = offer.getCounts().stream()
                    .map(count -> {
                        var bottlePriceEntity = count.getBottlePrice();

                        double basePrice = (bottlePriceEntity != null && bottlePriceEntity.getPrice() != null)
                                ? bottlePriceEntity.getPrice().doubleValue()
                                : 0.0;

                        double userFee = (bottlePriceEntity != null && bottlePriceEntity.getFee() != null)
                                ? bottlePriceEntity.getFee().doubleValue()
                                : 0.0;

                        double finalPriceForCollector = basePrice - userFee;

                        return OfferResponseDTO.ItemDTO.builder()
                                .bottleId(bottlePriceEntity != null ? bottlePriceEntity.getId() : null)
                                .quantity(count.getQuantity())
                                .price(finalPriceForCollector)
                                .fee(userFee)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        return OfferResponseDTO.builder()
                .offerId(offer.getId())
                .status(offer.getInfo() != null && offer.getInfo().getStatus() != null
                        ? offer.getInfo().getStatus().name()
                        : null)
                .latitude(offer.getInfo() != null && offer.getInfo().getLatitude() != null
                        ? offer.getInfo().getLatitude().doubleValue()
                        : null)
                .longitude(offer.getInfo() != null && offer.getInfo().getLongitude() != null
                        ? offer.getInfo().getLongitude().doubleValue()
                        : null)
                .pickupAddress(offer.getInfo() != null ? offer.getInfo().getPickupAddress() : null)
                .pickupInstructions(offer.getInfo() != null ? offer.getInfo().getPickupInstructions() : null)
                .createdAt(offer.getInfo() != null ? offer.getInfo().getTimeCreated() : null)
                .user(userDTO)
                .items(itemDTOs)
                .build();
    }

    @Transactional
    public boolean changeStatus(Long offer_id, Optional<Long> user_id, String new_status) {
        return offerRepository.findById(offer_id).map(offer -> {
            boolean change = false;

            User user = user_id
                    .map(id -> userRepository.findById(id)
                            .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + id)))
                    .orElse(null);

            var status = switch (new_status.trim().toUpperCase()) {
                case "OPEN" -> OfferStatus.OPEN;
                case "RESERVED" -> OfferStatus.RESERVED;
                case "COMPLETED" -> OfferStatus.COMPLETED;
                case "CANCELED" -> OfferStatus.CANCELED;
                default -> null;
            };

            if (offer.getInfo() != null) {
                offer.getInfo().setStatus(status);
                change = true;
            }

            if (status == OfferStatus.RESERVED) {
                offer.setCollector(user);
                change = true;
            }

            return change;

        }).orElse(false);
    }

    private boolean quantityVarCheck(OfferDTO dto) {
        return (dto.getAQuantity() != null && dto.getBQuantity() != null && dto.getCQuantity() != null
                && dto.getAQuantity() + dto.getBQuantity() + dto.getCQuantity() > 0);
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
