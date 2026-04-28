package pl.isigmas.kaucjapp.auth.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class User {

    @NotBlank(message = "Username is needed")
    @Size(min=6, max = 100)
    @Pattern(regexp = "^[a-zA-Z0-9]*$", message = "Username can only contain letters and numbers")
    private String username;

    @NotBlank(message = "Email is needed")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is needed")
    @Size(min=6)
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{6,}$",
            message = "Password must be minimum 6 characters long contain at least: one small letter, one big letter, one number and one special sign"
    )
    private String password;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^\\d{9,15}$", message = "Phone number must consist of 9-15 digits")
    private String phone;

    @NotBlank(message = "First name is needed")
    private String firstName;

    @NotBlank(message = "Last name is needed")
    private String lastName;

}
