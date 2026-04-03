package pl.isigmas.kaucjapp.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    private LocalDateTime createdAt;

    private List<OfferItemResponseDTO> items;

    @Data
    @Builder
    public static class OfferItemResponseDTO {
        @JsonProperty("bottle_id")
        private Long bottleId;

        @JsonProperty("bottle_name")
        private String name;

        private Integer quantity;

        @JsonProperty("unit_price")
        private BigDecimal unitPrice;

        @JsonProperty("deposit_fee")
        private BigDecimal depositFee;
    }
}