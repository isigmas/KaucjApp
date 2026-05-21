package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class OfferCompletedEventDTO {
    private Long offerId;
    private Long creatorId;
    private Long collectorId;

    /** Matches offers-service Kafka payload field name. */
    @JsonProperty("plastic_quantity")
    private int bottleQuantity;

    private int canQuantity;
}
