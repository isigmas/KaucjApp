package pl.isigmas.kaucjapp.offers.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.isigmas.kaucjapp.offers.model.Complainant;
import pl.isigmas.kaucjapp.offers.model.ComplaintReason;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponseDTO {
    private Long complaintId;
    private Long offerId;
    private Complainant complainant;
    private ComplaintReason complaintReason;
    private String message;
}