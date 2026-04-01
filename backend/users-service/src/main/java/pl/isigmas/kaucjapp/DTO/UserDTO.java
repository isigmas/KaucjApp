package pl.isigmas.kaucjapp.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    @JsonProperty("user_id")
    private Long id;

    @NotBlank(message = "First name cannot be blank")
    private String name;

    @NotBlank(message = "Last name cannot be blank")
    private String surname;

    @NotBlank(message = "Username cannot be blank")
    private String username;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^[0-9]{9,15}$", message = "Phone number must consist of 9-15 digits")
    @JsonProperty("phone_number")
    private String phoneNumber;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Default address cannot be blank")
    @JsonProperty("default_address")
    private String defaultAddress;

    @NotNull(message = "Default latitude is required")
    @JsonProperty("default_latitude")
    private BigDecimal defaultLatitude;

    @NotNull(message = "Default longitude is required")
    @JsonProperty("default_longitude")
    private BigDecimal defaultLongitude;
}