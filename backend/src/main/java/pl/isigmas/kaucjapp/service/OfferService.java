package pl.isigmas.kaucjapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.DTO.OfferDTO;
import pl.isigmas.kaucjapp.model.*;
import pl.isigmas.kaucjapp.repository.*;

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

        if (dto.getKaucjaQuantity() != null && dto.getKaucjaQuantity() > 0) {
            BottlePrice kaucjaPrice = bottlePriceRepository.findById(1L).orElse(null);
            if (kaucjaPrice != null) {
                OfferCount kaucjaCount = new OfferCount();
                kaucjaCount.setId(new OfferCountId(null, 1L));
                kaucjaCount.setOffer(offer);
                kaucjaCount.setBottlePrice(kaucjaPrice);
                kaucjaCount.setQuantity(dto.getKaucjaQuantity());
                counts.add(kaucjaCount);
            }
        }

        if (dto.getNonKaucjaQuantity() != null && dto.getNonKaucjaQuantity() > 0) {
            BottlePrice nonKaucjaPrice = bottlePriceRepository.findById(2L).orElse(null);
            if (nonKaucjaPrice != null) {
                OfferCount nonKaucjaCount = new OfferCount();
                nonKaucjaCount.setId(new OfferCountId(null, 2L));
                nonKaucjaCount.setOffer(offer);
                nonKaucjaCount.setBottlePrice(nonKaucjaPrice);
                nonKaucjaCount.setQuantity(dto.getNonKaucjaQuantity());
                counts.add(nonKaucjaCount);
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
                    if (count.getBottlePrice().getId() == 1L && dto.getKaucjaQuantity() != null) {
                        count.setQuantity(dto.getKaucjaQuantity());
                    } else if (count.getBottlePrice().getId() == 2L && dto.getNonKaucjaQuantity() != null) {
                        count.setQuantity(dto.getNonKaucjaQuantity());
                    }
                }
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
