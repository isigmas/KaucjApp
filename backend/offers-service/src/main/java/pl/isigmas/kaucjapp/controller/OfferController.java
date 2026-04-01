package pl.isigmas.kaucjapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.DTO.OfferDTO;
import pl.isigmas.kaucjapp.DTO.OfferResponseDTO;
import pl.isigmas.kaucjapp.service.OfferService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/offer")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService service;

    @PostMapping
    public ResponseEntity<Long> create(
            @Valid @RequestBody OfferDTO newOffer,
            @RequestHeader("X-User-Id") Long userId) {

        newOffer.setCreatorId(userId);
        Long newId = service.create(newOffer);
        log.info("New offer created with ID: {} by user: {}", newId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(newId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@RequestBody OfferDTO updatedOffer, @PathVariable Long id) {
        service.update(id, updatedOffer);
        log.info("Offer updated, ID: {}", id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.remove(id);
        log.info("Offer deleted, ID: {}", id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{offerId}/status/{newStatus}")
    public ResponseEntity<Void> changeStatus(
            @PathVariable Long offerId,
            @PathVariable String newStatus,
            @RequestHeader("X-User-Id") Long userId) {

        boolean success = service.changeStatus(offerId, userId, newStatus);

        if (!success) {
            log.warn("Could not change status of offer {} to {} for user {}", offerId, newStatus, userId);
            return ResponseEntity.badRequest().build();
        }

        log.info("Status of offer {} changed to {} by user {}", offerId, newStatus, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/szosti")
    public ResponseEntity<List<OfferResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<OfferResponseDTO>> getMyOffers(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.getAllByCreatorId(userId));
    }

    @GetMapping("/my/reserved")
    public ResponseEntity<List<OfferResponseDTO>> getMyReservedOffers(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.getReservedOffersByUserId(userId));
    }
}