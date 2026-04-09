package pl.isigmas.kaucjapp.deposit.DTO;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;


@Getter
@Builder
public class DepositMachineResponseDTO {
    private Long id;
    private String networkName;
    private String status;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;


}