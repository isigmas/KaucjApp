package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UserAddressDTO {

    @Size(max = 100, message = "Address label must be at most 100 characters")
    private String addressLabel;

    @NotBlank(message = "Address cannot be empty")
    @Size(max = 500, message = "Address must be at most 500 characters")
    private String address;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", inclusive = true, message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", inclusive = true, message = "Latitude must be between -90 and 90")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", inclusive = true, message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", inclusive = true, message = "Longitude must be between -180 and 180")
    private BigDecimal longitude;

    @JsonProperty("default")
    private boolean isDefault = false;
}
