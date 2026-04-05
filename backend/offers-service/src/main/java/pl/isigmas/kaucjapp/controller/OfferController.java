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

    @PostMapping("/offer")
    public ResponseEntity<Long> create(
            @Valid @RequestBody OfferDTO newOffer,
            @RequestHeader("X-User-Id") Long userId) {

        Long newId = service.create(userId, newOffer);
        log.info("New offer created with ID: {} by user: {}", newId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(newId);
    }

    @GetMapping("/test")
    public ResponseEntity<String> get200() {
        return ResponseEntity.ok("Ready");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
            @Valid @RequestBody OfferDTO updatedOffer,
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        service.update(id, userId, updatedOffer);
        log.info("Offer updated, ID: {}", id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        service.remove(id, userId);
        log.info("Offer deleted, ID: {}", id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{offerId}/status/{newStatus}")
    public ResponseEntity<Void> changeStatus(
            @PathVariable Long offerId,
            @PathVariable String newStatus,
            @RequestHeader("X-User-Id") Long userId) {
        service.changeStatus(offerId, userId, newStatus);
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

    @GetMapping("/search")
    public ResponseEntity<List<OfferResponseDTO>> searchOffersInArea(
            @RequestParam double swLat,
            @RequestParam double swLon,
            @RequestParam double neLat,
            @RequestParam double neLon) {

        log.info("Searching for offers in Bounding Box: SW[{}, {}] to NE[{}, {}]", swLat, swLon, neLat, neLon);
        return ResponseEntity.ok(service.getOffersInArea(swLat, swLon, neLat, neLon));
    }
}