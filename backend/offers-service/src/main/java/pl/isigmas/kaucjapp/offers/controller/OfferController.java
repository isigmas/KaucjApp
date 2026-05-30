package pl.isigmas.kaucjapp.offers.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.offers.DTO.*;
import pl.isigmas.kaucjapp.offers.service.OfferService;

import java.util.List;

@RestController
@RequestMapping("/api/offer")
@RequiredArgsConstructor
@Tag(
        name = "Offers",
        description = "Deposit-bottle offers: create, full replace update, search (OPEN only in bbox), and status lifecycle. "
                + "Mutating endpoints use header X-User-Id as the acting user (trusted from gateway in this service). "
                + "Errors return ApiError: errorCode, message, path, optional validationErrors.")
public class OfferController {

    private final OfferService service;
    private final Logger logger;



        @GetMapping("/test")
    @Operation(
            summary = "Offers controller smoke test",
            description = "Returns plain text if this controller is mapped. Prefer GET /api/status for service health.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Body: \"Ready\".")
    })
    public ResponseEntity<String> get200() {
        return ResponseEntity.ok("Ready");
    }



    @PostMapping("/offer")
    @Operation(
            summary = "Create new offer",
            description = "Creates an OPEN offer for the user in X-User-Id. Body: OfferDTO — lat/lon must fall inside Poland (OFFER_003 otherwise); "
                    + "pickupAddress required; items non-empty with bottleId, quantity ≥ 1, unitPrice in [0, 0.5]. "
                    + "Creator id is taken from the header, not from JSON.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Offer created; response body is the new offer id (Long)."),
            @ApiResponse(responseCode = "400", description = "VALIDATION_ERR / MALFORMED_JSON / BAD_REQUEST (e.g. missing X-User-Id); OFFER_003 if location outside Poland."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (only if enforced upstream; not emitted by this service)."),
            @ApiResponse(responseCode = "404", description = "BOTTLE_001 — referenced bottle type id does not exist."),
            @ApiResponse(responseCode = "500", description = "INTERNAL_ERR — unexpected error.")
    })
    public ResponseEntity<Long> create(
            @Valid @RequestBody OfferDTO newOffer,
            @RequestHeader("X-User-Id") Long userId) {

        Long newId = service.create(userId, newOffer);
        logger.info("New offer created with ID: %d by user: %d".formatted(newId, userId));
        return ResponseEntity.status(HttpStatus.CREATED).body(newId);
    }





    @PatchMapping("/{id}")
    @Operation(
            summary = "Partially update offer",
            description = "Partial update of an OPEN offer. Any omitted field keeps its current value. "
                    + "If `items` is present, it replaces the item set using the provided list: existing bottle types are updated, "
                    + "new bottle ids add rows, and omitted bottle types are removed. Only the creator (X-User-Id) may call this.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Offer updated; empty body."),
            @ApiResponse(responseCode = "400", description = "VALIDATION_ERR / MALFORMED_JSON / BAD_REQUEST; OFFER_003 if location outside Poland."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (only if enforced upstream)."),
            @ApiResponse(responseCode = "403", description = "SECURITY_FORBIDDEN — caller is not the offer creator."),
            @ApiResponse(responseCode = "404", description = "OFFER_001 — offer not found; BOTTLE_001 — unknown bottle type in items."),
            @ApiResponse(responseCode = "409", description = "STATE_CONFLICT — e.g. offer is not OPEN."),
            @ApiResponse(responseCode = "500", description = "INTERNAL_ERR — unexpected error.")
    })
    public ResponseEntity<Void> update(
            @Valid @RequestBody UpdateOfferDTO updatedOffer,
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        service.update(id, userId, updatedOffer);
        logger.info("Offer updated, ID: %d".formatted(id));
        return ResponseEntity.ok().build();
    }




    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete offer by id",
            description = "Hard-deletes the offer when X-User-Id matches creator_id.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Offer deleted; empty body (not 204)."),
            @ApiResponse(responseCode = "400", description = "BAD_REQUEST — e.g. missing X-User-Id."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (only if enforced upstream)."),
            @ApiResponse(responseCode = "403", description = "SECURITY_FORBIDDEN — caller is not the creator."),
            @ApiResponse(responseCode = "404", description = "OFFER_001 — offer not found."),
            @ApiResponse(responseCode = "500", description = "INTERNAL_ERR — unexpected error.")
    })
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        service.remove(id, userId);
        logger.important("Offer deleted, ID: %d".formatted(id));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferResponseDTO> getOffer(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        OfferResponseDTO offer = service.getOffer(id, userId);
        logger.info("Fetched offer with ID: %d for user: %d".formatted(id, userId));
        return ResponseEntity.ok(offer);
    }



    @PostMapping("/{offerId}/status/{newStatus}")
    @Operation(
            summary = "Change offer status",
            description = "Path newStatus: case-insensitive enum name (e.g. OPEN, RESERVED, COMPLETED, CANCELED). "
                    + "Rules: RESERVED — collector cannot be the creator; OPEN — unreserve (collector or flow rules); "
                    + "COMPLETED — only RESERVED and only by current collector; CANCELED — only creator. "
                    + "COMPLETED and CANCELED are terminal for further transitions (STATE_CONFLICT).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated; empty body."),
            @ApiResponse(responseCode = "400", description = "OFFER_003 — invalid status string; other BAD_REQUEST where applicable."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (only if enforced upstream)."),
            @ApiResponse(responseCode = "403", description = "SECURITY_FORBIDDEN — role/state forbids action (e.g. reserve own offer, wrong collector)."),
            @ApiResponse(responseCode = "404", description = "OFFER_001 — offer not found."),
            @ApiResponse(responseCode = "409", description = "STATE_CONFLICT — illegal transition; OFFER_005/OFFER_006 — already reserved by another user."),
            @ApiResponse(responseCode = "500", description = "INTERNAL_ERR — unexpected error.")
    })
    public ResponseEntity<Void> changeStatus(
            @PathVariable Long offerId,
            @PathVariable String newStatus,
            @RequestHeader("X-User-Id") Long userId) {
        service.changeStatus(offerId, userId, newStatus);
        logger.info("Status of offer %d changed to %s by user %d".formatted(offerId, newStatus, userId));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirm/{offerId}")
    public ResponseEntity<Void> confirmOffer(
            @PathVariable Long offerId,
            @RequestHeader("X-User-Id") Long userId){
        service.confirmOffer(offerId,userId);
        logger.info("Confirmation of offer %d by user %d".formatted(offerId, userId));
        return ResponseEntity.ok().build();
    }



    @GetMapping("/szosti")
    @Operation(
            summary = "List all offers",
            description = "Returns every offer in the database (all statuses), mapped to OfferResponseDTO with aggregated plastic/can quantities and totals. "
                    + "No auth header; restrict at gateway if needed.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of OfferResponseDTO (may be empty)."),
            @ApiResponse(responseCode = "500", description = "INTERNAL_ERR — unexpected error.")
    })
    public ResponseEntity<List<OfferResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }



    @GetMapping("/my")
    @Operation(
            summary = "List my created offers",
            description = "Offers where creator_id equals X-User-Id (any status).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of OfferResponseDTO (may be empty)."),
            @ApiResponse(responseCode = "400", description = "BAD_REQUEST — missing X-User-Id."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (only if enforced upstream)."),
            @ApiResponse(responseCode = "500", description = "INTERNAL_ERR — unexpected error.")
    })
    public ResponseEntity<List<OfferResponseDTO>> getMyOffers(@RequestHeader("X-User-Id") Long userId) {
        logger.info("Listing my offers by user %d".formatted(userId));
        return ResponseEntity.ok(service.getAllByCreatorId(userId));
    }




    @GetMapping("/my/reserved")
    @Operation(
            summary = "List my reserved offers",
            description = "Offers in status RESERVED where collector_id equals X-User-Id.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of OfferResponseDTO (may be empty)."),
            @ApiResponse(responseCode = "400", description = "BAD_REQUEST — missing X-User-Id."),
            @ApiResponse(responseCode = "401", description = "Not authenticated (only if enforced upstream)."),
            @ApiResponse(responseCode = "500", description = "INTERNAL_ERR — unexpected error.")
    })
    public ResponseEntity<List<OfferResponseDTO>> getMyReservedOffers(@RequestHeader("X-User-Id") Long userId) {
        logger.info("Listing my reserved offers by user %d".formatted(userId));
        return ResponseEntity.ok(service.getReservedOffersByUserId(userId));
    }

    

    @GetMapping("/search")
    @Operation(
            summary = "Search OPEN offers in bounding box",
            description = "Query: southwest corner (swLat, swLon) and northeast corner (neLat, neLon). "
                    + "Returns only offers with status OPEN whose coordinates lie inside the box. "
                    + "No auth header required unless the gateway injects one.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of OfferResponseDTO (may be empty)."),
            @ApiResponse(responseCode = "500", description = "INTERNAL_ERR — unexpected error.")
    })
    public ResponseEntity<List<OfferResponseDTO>> searchOffersInArea(
            @RequestParam double swLat,
            @RequestParam double swLon,
            @RequestParam double neLat,
            @RequestParam double neLon) {

        logger.info("Searching for offers in bounding box: SW[%s, %s] to NE[%s, %s]"
                .formatted(swLat, swLon, neLat, neLon));
        return ResponseEntity.ok(service.getOffersInArea(swLat, swLon, neLat, neLon));
    }

    @PostMapping("/complaint/{id}")
    public ResponseEntity<Void> makeComplaint(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ComplaintDTO complaintDTO
            ) {
        service.addComplaint(userId, id, complaintDTO);
        logger.important("Creating complaint for offer %d by user %d".formatted(id, userId));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{offerId}/complaints")
    public ResponseEntity<List<ComplaintResponseDTO>> listMyComplaintsForOffer(
            @PathVariable Long offerId,
            @RequestHeader("X-User-Id") Long userId
    ) {
        logger.info("Listing my complaints for offer %d by user %d".formatted(offerId, userId));

        return ResponseEntity.ok(service.getMyComplaintsForOffer(offerId, userId));
    }

    @GetMapping("/my/history")
    public ResponseEntity<List<OfferResponseDTO>> listMyOffersHistory(
            @RequestHeader("X-User-Id") Long userId
    ) {
        logger.info("Listing my offers history by user %d".formatted(userId));

        return ResponseEntity.ok(service.getMyOffersHistory(userId));
    }

    @GetMapping("/my/reserved/history")
    public ResponseEntity<List<OfferResponseDTO>> listMyReservedOffersHistory(
            @RequestHeader("X-User-Id") Long userId
    ) {
        logger.info("Listing my collected offers history by user %d".formatted(userId));

        return ResponseEntity.ok(service.getMyCollectedOffersHistory(userId));
    }



}
