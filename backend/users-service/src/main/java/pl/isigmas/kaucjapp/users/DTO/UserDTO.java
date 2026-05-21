package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    @JsonProperty("user_id")
    private Long id;

    @NotBlank(message = "Username cannot be blank")
    private String username;

    @NotBlank(message = "First name cannot be blank")
    private String firstName;

    @NotBlank(message = "Last name cannot be blank")
    private String lastName;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^[0-9]{9,15}$", message = "Phone number must consist of 9-15 digits")
    @JsonProperty("phone")
    private String phone;

    @JsonProperty("profile_picture_url")
    private String profilePictureUrl;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("collected_bottle_count")
    private Integer collectedBottleCount;

    @JsonProperty("collected_can_count")
    private Integer collectedCanCount;

    @JsonProperty("returned_bottle_count")
    private Integer returnedBottleCount;

    @JsonProperty("returned_can_count")
    private Integer returnedCanCount;

    @JsonProperty("returned_total_count")
    private Integer returnedTotalCount;

    @JsonProperty("collected_total_count")
    private Integer collectedTotalCount;

    @Valid
    private List<UserAddressDTO> addresses = new ArrayList<>();
}