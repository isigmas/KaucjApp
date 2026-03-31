package pl.isigmas.kaucjapp.DTO;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin; 
import jakarta.validation.constraints.NotNull;   
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferDTO {

    private Long creatorId;
    private BigDecimal latitude;
    private BigDecimal longitude;

    @Min(0) @NotNull private Integer aQuantity;
    @DecimalMin("0.0") @NotNull private BigDecimal aPrice;
    @DecimalMin("0.0") @NotNull private BigDecimal aFee;

    @Min(0) @NotNull private Integer bQuantity;
    @DecimalMin("0.0") @NotNull private BigDecimal bPrice;
    @DecimalMin("0.0") @NotNull private BigDecimal bFee;

    @Min(0) @NotNull private Integer cQuantity;
    @DecimalMin("0.0") @NotNull private BigDecimal cPrice;
    @DecimalMin("0.0") @NotNull private BigDecimal cFee;

    @NotBlank private String pickupAddress;
    private String pickupInstructions;
}