package pl.isigmas.kaucjapp.controller;

import lombok.RequiredArgsConstructor;
import pl.isigmas.kaucjapp.DTO.OfferDTO;
import pl.isigmas.kaucjapp.repository.OfferRepo;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OfferController {

    private final OfferRepo repo;

    private static final Logger log = LoggerFactory.getLogger(OfferController.class);

    @PostMapping("/offer")
    public ResponseEntity<Void> create(@RequestBody OfferDTO newOffer) {

        Long newId = repo.create(newOffer);

        if (newId == null) {
            log.warn("Failed to create offer. Probably invalid creatorId.");
            return ResponseEntity.badRequest().build();
        }

        log.info("New offer created, ID: " + newId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/offer/{id}")
    public ResponseEntity<Void> update(@RequestBody OfferDTO updatedOffer, @PathVariable Long id) {

        boolean isUpdated = repo.update(id, updatedOffer);

        if (isUpdated) {
            log.info("Offer updated, ID: " + id);
            return ResponseEntity.ok().build();
        } else {
            log.warn("Offer update failed. Offer ID: " + id + " not found.");
            return ResponseEntity.notFound().build();
        }
    }
}