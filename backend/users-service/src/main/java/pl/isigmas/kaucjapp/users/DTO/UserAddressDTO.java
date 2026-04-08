package pl.isigmas.kaucjapp.users.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UserAddressDTO {

    private String addressLabel;

    @NotBlank(message = "Address cannot be empty")
    private String address;

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;

    private boolean isDefault = false;
}