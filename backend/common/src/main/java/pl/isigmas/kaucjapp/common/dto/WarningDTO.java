package pl.isigmas.kaucjapp.common.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record WarningDTO(
    UUID id,
    Instant time,
    String message
) {}
