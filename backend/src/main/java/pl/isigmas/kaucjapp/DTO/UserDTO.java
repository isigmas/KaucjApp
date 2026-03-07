package pl.isigmas.kaucjapp.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long creatorId;
    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
    private Integer kaucjaQuantity;
    private Integer nonKaucjaQuantity;
    private String pickupAddress;
    private String pickupInstructions;

    private Long userId;
    private String userName;
    private String email;
    private int phoneNumber;
    private java.math.BigDecimal defaultLatitude;
    private java.math.BigDecimal defaultLongitude;

}
