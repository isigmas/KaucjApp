package pl.isigmas.kaucjapp.deposit.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import pl.isigmas.kaucjapp.deposit.model.DepositMachineStatus;

import java.math.BigDecimal;
import java.util.List;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepositMachineResponseDTO {
    private String networkName;
    private DepositMachineStatus status;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;

    private List<OpeningHourDTO> openingHours;
}