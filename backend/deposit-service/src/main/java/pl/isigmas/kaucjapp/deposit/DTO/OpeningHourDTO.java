package pl.isigmas.kaucjapp.deposit.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import pl.isigmas.kaucjapp.deposit.validation.ConsistentOpeningHour;

import java.time.LocalTime;

@ConsistentOpeningHour
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpeningHourDTO {
    @NotNull
    @Min(1)
    @Max(7)
    private Integer dayOfWeek;

    private Boolean isClosed;

    @NotNull
    private LocalTime openTime;

    @NotNull
    private LocalTime closeTime;
}
