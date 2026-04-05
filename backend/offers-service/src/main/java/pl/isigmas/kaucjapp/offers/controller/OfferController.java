package pl.isigmas.kaucjapp.offers.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.offers.DTO.OfferDTO;
import pl.isigmas.kaucjapp.offers.DTO.OfferResponseDTO;
import pl.isigmas.kaucjapp.offers.service.OfferService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/offer")
@RequiredArgsConstructor
@Tag(name = "Offers", description = "Deposit-bottle offers: create, update, search, and lifecycle. Creator identity comes from X-User-Id where noted.")
public class OfferController {

    private final OfferService service;

    @PostMapping("/offer")
    @Operation(
            summary = "Create new offer",
            description = "Creates an offer for the user in X-User-Id. Body must not include creator id; items reference bottle type ids.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Offer created; body is the new offer id."),
            @ApiResponse(responseCode = "400", description = "Validation error or missing X-User-Id."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (if enforced upstream)."),
            @ApiResponse(responseCode = "404", description = "Referenced bottle type not found.")
    })
    public ResponseEntity<Long> create(
            @Valid @RequestBody OfferDTO newOffer,
            @RequestHeader("X-User-Id") Long userId) {

        Long newId = service.create(userId, newOffer);
        log.info("New offer created with ID: {} by user: {}", newId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(newId);
    }

    @GetMapping("/test")
    @Operation(
            summary = "Offers service test",
            description = "Lightweight check that this controller is mapped under /api/offer/test.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plain text readiness hint.")
    })
    public ResponseEntity<String> get200() {
        return ResponseEntity.ok("Ready");
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update existing offer",
            description = "Replaces offer fields and line items. Only the creator (X-User-Id) may update; offer must be OPEN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Offer updated."),
            @ApiResponse(responseCode = "400", description = "Validation error or missing header."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (if enforced upstream)."),
            @ApiResponse(responseCode = "403", description = "Caller is not the offer creator."),
            @ApiResponse(responseCode = "404", description = "Offer or bottle type not found."),
            @ApiResponse(responseCode = "409", description = "Illegal state (e.g. offer not OPEN).")
    })
    public ResponseEntity<Void> update(
            @Valid @RequestBody OfferDTO updatedOffer,
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        service.update(id, userId, updatedOffer);
        log.info("Offer updated, ID: {}", id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete offer by id",
            description = "Deletes the offer if X-User-Id matches the creator.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Offer deleted."),
            @ApiResponse(responseCode = "400", description = "Missing or invalid X-User-Id."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (if enforced upstream)."),
            @ApiResponse(responseCode = "403", description = "Caller is not the creator."),
            @ApiResponse(responseCode = "404", description = "Offer not found.")
    })
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        service.remove(id, userId);
        log.info("Offer deleted, ID: {}", id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{offerId}/status/{newStatus}")
    @Operation(
            summary = "Change offer status",
            description = "Transitions offer state (e.g. RESERVED, COMPLETED). Rules depend on current state and caller; X-User-Id identifies the acting user.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated."),
            @ApiResponse(responseCode = "400", description = "Unknown status value or bad request."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (if enforced upstream)."),
            @ApiResponse(responseCode = "403", description = "Action not allowed for this user."),
            @ApiResponse(responseCode = "404", description = "Offer not found."),
            @ApiResponse(responseCode = "409", description = "Illegal transition for current state.")
    })
    public ResponseEntity<Void> changeStatus(
            @PathVariable Long offerId,
            @PathVariable String newStatus,
            @RequestHeader("X-User-Id") Long userId) {
        service.changeStatus(offerId, userId, newStatus);
        log.info("Status of offer {} changed to {} by user {}", offerId, newStatus, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/szosti")
    @Operation(
            summary = "List all offers",
            description = "Returns every offer with items and metadata. Public within the service; protect at gateway if needed.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Array of offers.")
    })
    public ResponseEntity<List<OfferResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/my")
    @Operation(
            summary = "List my created offers",
            description = "Offers where creator_id equals X-User-Id.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Array of offers (may be empty)."),
            @ApiResponse(responseCode = "400", description = "Missing or invalid X-User-Id."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (if enforced upstream).")
    })
    public ResponseEntity<List<OfferResponseDTO>> getMyOffers(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.getAllByCreatorId(userId));
    }

    @GetMapping("/my/reserved")
    @Operation(
            summary = "List my reserved offers",
            description = "Offers RESERVED by the user in X-User-Id (collector).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Array of offers (may be empty)."),
            @ApiResponse(responseCode = "400", description = "Missing or invalid X-User-Id."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (if enforced upstream).")
    })
    public ResponseEntity<List<OfferResponseDTO>> getMyReservedOffers(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.getReservedOffersByUserId(userId));
    }

    @GetMapping("/search")
    @Operation(
            summary = "Search offers in bbox",
            description = "Bounding box: southwest (swLat, swLon) and northeast (neLat, neLon) corners. No auth header required unless the gateway adds one.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Matching offers."),
            @ApiResponse(responseCode = "400", description = "Invalid query parameters.")
    })
    public ResponseEntity<List<OfferResponseDTO>> searchOffersInArea(
            @RequestParam double swLat,
            @RequestParam double swLon,
            @RequestParam double neLat,
            @RequestParam double neLon) {

        log.info("Searching for offers in Bounding Box: SW[{}, {}] to NE[{}, {}]", swLat, swLon, neLat, neLon);
        return ResponseEntity.ok(service.getOffersInArea(swLat, swLon, neLat, neLon));
    }
}