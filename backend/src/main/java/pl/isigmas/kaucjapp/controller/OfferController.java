package pl.isigmas.kaucjapp.controller;

import lombok.RequiredArgsConstructor;
import pl.isigmas.kaucjapp.model.Offer;
import pl.isigmas.kaucjapp.DTO.OfferDTO;
import pl.isigmas.kaucjapp.service.OfferService;
import pl.isigmas.kaucjapp.DTO.OfferResponseDTO;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService service;
    private static final Logger log = LoggerFactory.getLogger(OfferController.class);

    @PostMapping("/offer")
    public ResponseEntity<Void> create(@RequestBody OfferDTO newOffer) {
        Long newId;
        try {
            newId = service.create(newOffer);
        } catch (Exception e) {
            log.error("Error creating offer: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        log.info("New offer created, ID: " + newId);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/offer/{id}")
    public ResponseEntity<Void> update(@RequestBody OfferDTO updatedOffer, @PathVariable Long id) {
        boolean done;
        try {
            done = service.update(id, updatedOffer);
        } catch (Exception e) {
            log.error("Error updating offer with ID " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        log.info("Offer updated, ID: " + id);

        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @DeleteMapping("/offer/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean deleted;
        try {
            deleted = service.remove(id);
            log.info("Offer deleted, ID: " + id);
        } catch (Exception e) {
            log.error("Error deleting offer with ID " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PostMapping("/reserve-offer/{offer_id}/{user_id}")
    public ResponseEntity<Void> reserveOffer(@PathVariable Long offer_id, @PathVariable Long user_id) {
        boolean reserved;
        try {
            reserved = service.reserveOffer(offer_id, user_id);
            if (!reserved) {
                log.warn("Failed to reserve offer with ID " + offer_id + " for user ID " + user_id);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            log.info("Offer reserved, Offer ID: " + offer_id + ", User ID: " + user_id);
        } catch (Exception e) {
            log.error("Error reserving offer with ID " + offer_id + " for user ID " + user_id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping("/szosti")
    public ResponseEntity<List<OfferResponseDTO>> getAll() {
        List<OfferResponseDTO> offers;
        try {
            offers = service.getAll();
        } catch (Exception e) {
            log.error("Error fetching offers: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.ok(offers);
    }
}
