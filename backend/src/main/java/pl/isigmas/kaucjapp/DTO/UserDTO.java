package pl.isigmas.kaucjapp.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    @JsonProperty("user_id")
    private Long id;

    private String name;

    private String surname;

    private String username;

    @JsonProperty("phone_number")
    private String phoneNumber;

    private String email;

    @JsonProperty("default_address")
    private String defaultAddress;

    @JsonProperty("default_latitude")
    private String defaultLatitude;

    @JsonProperty("default_longitude")
    private String defaultLongitude;
}