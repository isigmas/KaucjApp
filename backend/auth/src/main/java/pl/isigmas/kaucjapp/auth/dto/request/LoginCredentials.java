package pl.isigmas.kaucjapp.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginCredentials {

    @NotBlank(message = "Either username or email must be provided")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;

    @Size(max = 255)
    private String deviceInfo;
}
