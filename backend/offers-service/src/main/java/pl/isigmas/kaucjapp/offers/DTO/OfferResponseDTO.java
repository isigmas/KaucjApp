package pl.isigmas.kaucjapp.offers.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class OfferResponseDTO {

    @JsonProperty("offer_id")
    private Long offerId;

    @JsonProperty("creator_id")
    private Long creatorId;

    @JsonProperty("collector_id")
    private Long collectorId;

    private String status;
    private BigDecimal latitude;
    private BigDecimal longitude;

    @JsonProperty("pickup_address")
    private String pickupAddress;

    @JsonProperty("pickup_instructions")
    private String pickupInstructions;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("reserved_at")
    private Instant reservedAt;

    @JsonProperty("reserved_to")
    private Instant reservedTo;

    @JsonProperty("creator_confirmed")
    private Boolean creatorConfirmed;

    @JsonProperty("collector_confirmed")
    private Boolean collectorConfirmed;

    @JsonProperty("confirmation_deadline")
    private Instant confirmationDeadline;

    @JsonProperty("plastic_quantity")
    private int plasticQuantity;

    @JsonProperty("can_quantity")
    private int canQuantity;

    @JsonProperty("total_quantity")
    private int totalQuantity;

    /** Total payout to the person handing in bottles (deposit returner), per-bottle reward × quantity. */
    @JsonProperty("total_prize")
    private BigDecimal totalPrize;

    /** Total margin for the collector (statutory deposit − unit price per bottle) × quantity. */
    @JsonProperty("total_income")
    private BigDecimal totalIncome;

    @JsonProperty("plastic_price")
    private BigDecimal plasticPrice;

    @JsonProperty("can_price")
    private BigDecimal canPrice;
}
