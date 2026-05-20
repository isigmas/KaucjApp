package pl.isigmas.kaucjapp.deposit.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class DepositMachineResponseDTO {

    @NotBlank
    private Long id;

    @NotBlank
    private String networkName;

    @NotNull
    private DepositMachineStatus status;

    @NotBlank
    private String address;

    @NotNull
    @DecimalMin(value = "-90.0", inclusive = true)
    @DecimalMax(value = "90.0", inclusive = true)
    private BigDecimal latitude;

    @NotNull
    @DecimalMin(value = "-180.0", inclusive = true)
    @DecimalMax(value = "180.0", inclusive = true)
    private BigDecimal longitude;

    @NotEmpty
    @Valid
    @UniqueDaysOfWeek
    private List<OpeningHourDTO> openingHours;

    @JsonProperty("avg_score")
    private BigDecimal avgScore;

    @JsonProperty("feedback_count")
    private Integer feedbackCount;
}
