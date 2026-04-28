package pl.isigmas.kaucjapp.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MailRequest {

    @NotBlank(message = "Username cannot be empty")
    private String username;

    @NotBlank(message = "Receiver email must be provided")
    @Email(message = "Invalid email format")
    private String emailTo;

    @NotBlank(message = "Message cannot be empty")
    private String message;
}
