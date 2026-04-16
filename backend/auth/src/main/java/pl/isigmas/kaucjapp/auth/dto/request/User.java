package pl.isigmas.kaucjapp.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class User {

    @NotBlank(message = "Username is needed")
    @Size(max = 100)
    private String username;

    @NotBlank(message = "Email is needed")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is needed")
    private String password;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^\\d{9,15}$", message = "Phone number must consist of 9-15 digits")
    private String phone;

    @NotBlank(message = "First name is needed")
    private String firstName;

    @NotBlank(message = "Last name is needed")
    private String lastName;

}
