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
            BottlePrice aPrice = bottlePriceRepository.save(
                    BottlePrice.builder()
                            .price(dto.getAPrice())
                            .fee(dto.getAFee())
                            .build()
            );
            if (aPrice != null) {
                OfferCount aCount = new OfferCount();
                aCount.setId(new OfferCountId(null, aPrice.getId()));
                aCount.setOffer(offer);
                aCount.setBottlePrice(aPrice);
                aCount.setQuantity(dto.getAQuantity());
                counts.add(aCount);
            }
        }

        if (dto.getBQuantity() != null && dto.getBQuantity() > 0) {
            BottlePrice bPrice = bottlePriceRepository.save(
                    BottlePrice.builder()
                            .price(dto.getBPrice())
                            .fee(dto.getBFee())
                            .build()
            );
            if (bPrice != null) {
                OfferCount bCount = new OfferCount();
                bCount.setId(new OfferCountId(null, bPrice.getId()));
                bCount.setOffer(offer);
                bCount.setBottlePrice(bPrice);
                bCount.setQuantity(dto.getBQuantity());
                counts.add(bCount);
            }
        }

        if (dto.getCQuantity() != null && dto.getCQuantity() > 0) {
            BottlePrice cPrice = bottlePriceRepository.save(
                    BottlePrice.builder()
                            .price(dto.getCPrice())
                            .fee(dto.getCFee())
                            .build()
            );
            if (cPrice != null) {
                OfferCount cCount = new OfferCount();
                cCount.setId(new OfferCountId(null, cPrice.getId()));
                cCount.setOffer(offer);
                cCount.setBottlePrice(cPrice);
                cCount.setQuantity(dto.getCQuantity());
                counts.add(cCount);
            }
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
                    if (bottlePrice == null) continue;

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
    public boolean reserveOffer(Long offer_id, Long user_id) {
        return offerRepository.findById(offer_id).map(offer -> {
            User user = userRepository.findById(user_id)
                    .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + user_id));

            if (offer.getInfo() != null) {
                offer.getInfo().setStatus(OfferStatus.RESERVED);
                offer.setCollector(user);
                return true;
            }

            return false;

        }).orElse(false);
    }

    private boolean quantityVarCheck(OfferDTO dto) {
        return (dto.getAQuantity() != null && dto.getBQuantity() != null && dto.getCQuantity() != null
                && dto.getAQuantity() + dto.getBQuantity() + dto.getCQuantity() > 0);
    }
}
