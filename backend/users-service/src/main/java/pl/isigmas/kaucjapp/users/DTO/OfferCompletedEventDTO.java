package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RegisterReflectionForBinding
public class OfferCompletedEventDTO {

    @JsonProperty("offer_id")
    private Long offerId;

    @JsonProperty("creator_id")
    private Long creatorId;

    @JsonProperty("collector_id")
    private Long collectorId;

    @JsonProperty("plastic_quantity")
    private int plasticQuantity;

    @JsonProperty("can_quantity")
    private int canQuantity;
}
