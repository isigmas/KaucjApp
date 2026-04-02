package pl.isigmas.kaucjapp.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferDTO {

    private BigDecimal latitude;
    private BigDecimal longitude;

    @NotBlank(message = "Pickup address is needed")
    private String pickupAddress;

    private String pickupInstructions;

    @NotEmpty(message = "Offer has to contain items")
    @Valid
    private List<OfferItemRequestDTO> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OfferItemRequestDTO {

        @NotNull(message = "ID type is needed")
        private Long bottleId;

        @Min(value = 0, message = "Quantity cannot be lower than 0")
        @NotNull(message = "Quantity is needed")
        private Integer quantity;

        @DecimalMin(value = "0.0", message = "Unit price cannot be lower than 0")
        @NotNull(message = "Unit price is needed")
        private BigDecimal unitPrice;
    }
}