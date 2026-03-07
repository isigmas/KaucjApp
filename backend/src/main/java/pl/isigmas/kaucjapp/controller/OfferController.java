package pl.isigmas.kaucjapp.controller;

import pl.isigmas.kaucjapp.DTO.OfferDTO;
import pl.isigmas.kaucjapp.repository.OfferRepo;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
public class OfferController {
    private static final OfferRepo repo = new OfferRepo();
    private static final Logger log = LoggerFactory.getLogger(OfferController.class);

    @PutMapping("/offer")
    public ResponseEntity<Void> create(@RequestBody OfferDTO newOffer) {
        Long newId;
        try {
            newId = repo.create();
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
            done = repo.update();
        } catch (Exception e) {
            log.error("Error updating offer with ID " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        log.info("Offer updated, ID: " + id);

        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
