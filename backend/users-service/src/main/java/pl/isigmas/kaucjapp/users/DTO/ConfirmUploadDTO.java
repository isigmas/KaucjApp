package pl.isigmas.kaucjapp.users.DTO;

import jakarta.validation.constraints.NotBlank;

public record ConfirmUploadDTO(@NotBlank String blobName) {}
