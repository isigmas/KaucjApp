package pl.isigmas.kaucjapp.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MailRequest {

    @NotBlank(message = "Receiver email must be provided")
    @Email(message = "Invalid email format")
    private String emailTo;

    @NotBlank(message = "Message cannot be empty")
    private String message;
}
