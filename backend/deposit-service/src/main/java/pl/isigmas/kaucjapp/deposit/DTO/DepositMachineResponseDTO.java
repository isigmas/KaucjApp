package pl.isigmas.kaucjapp.deposit.DTO;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.util.List;


@Getter
@Builder
public class DepositMachineResponseDTO {
    private Long id;
    private String networkName;
    private String status;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;

    private List<OpeningHourDTO> openingHours;
}