package pl.isigmas.kaucjapp.deposit.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpeningHourDTO {
    private Integer dayOfWeek; // 1 = monday, 7 = sunday
    private LocalTime openTime;
    private LocalTime closeTime;
}