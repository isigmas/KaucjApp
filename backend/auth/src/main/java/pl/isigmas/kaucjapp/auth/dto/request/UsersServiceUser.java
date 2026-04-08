package pl.isigmas.kaucjapp.auth.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UsersServiceUser {

    @JsonProperty("user_id")
    @NotNull(message = "Id cannot be blank")
    private Long id;

    @NotBlank(message = "Username cannot be blank")
    private String username;

    @NotBlank(message = "First name cannot be blank")
    private String firstName;

    @NotBlank(message = "Last name cannot be blank")
    private String lastName;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^\\d{9,15}$", message = "Phone number must consist of 9-15 digits")
    @JsonProperty("phone")
    private String phone;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;
}
