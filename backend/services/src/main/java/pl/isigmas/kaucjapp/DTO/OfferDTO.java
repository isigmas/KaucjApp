package pl.isigmas.kaucjapp.DTO;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferDTO {

    private Long creatorId;
    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
    private BigDecimal aPrice;
    private BigDecimal aFee;
    private Integer aQuantity;
    private BigDecimal bPrice;
    private BigDecimal bFee;
    private Integer bQuantity;
    private BigDecimal cPrice;
    private BigDecimal cFee;
    private Integer cQuantity;
    private String pickupAddress;
    private String pickupInstructions;

}
