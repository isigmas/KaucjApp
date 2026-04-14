package pl.isigmas.kaucjapp.deposit.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineStatus;
import pl.isigmas.kaucjapp.deposit.validation.UniqueDaysOfWeek;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMachineDTO {

    private String networkName;

    private DepositMachineStatus status;
    private String address;

    @DecimalMin(value = "-90.0", inclusive = true)
    @DecimalMax(value = "90.0", inclusive = true)
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", inclusive = true)
    @DecimalMax(value = "180.0", inclusive = true)
    private BigDecimal longitude;

    @Valid
    @UniqueDaysOfWeek
    private List<OpeningHourDTO> openingHours;
}
