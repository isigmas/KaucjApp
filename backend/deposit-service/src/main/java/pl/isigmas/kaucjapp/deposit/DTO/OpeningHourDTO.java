package pl.isigmas.kaucjapp.deposit.DTO;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalTime;

@Getter
@Builder
public class OpeningHourDTO {
    private Integer dayOfWeek; // 1 = monday, 7 = sunday
    private LocalTime openTime;
    private LocalTime closeTime;
}