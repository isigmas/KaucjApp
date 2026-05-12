package pl.isigmas.kaucjapp.offers.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.isigmas.kaucjapp.offers.model.ComplaintReason;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDTO {

    @NotNull
    private ComplaintReason complaintReason;

    private String message;
}
