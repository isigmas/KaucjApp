package pl.isigmas.kaucjapp.users.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferCompletedEventDTO {
    private Long offerId;
    private Long creatorId;
    private Long collectorId;
    private int plasticQuantity;
    private int canQuantity;
}