package pl.isigmas.kaucjapp.offers.DTO;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOfferDTO {

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String pickupAddress;

    private String pickupInstructions;

    @Valid
    private List<OfferDTO.OfferItemRequestDTO> items;
}