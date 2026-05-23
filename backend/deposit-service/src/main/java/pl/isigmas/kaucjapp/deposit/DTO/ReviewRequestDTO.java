package pl.isigmas.kaucjapp.deposit.DTO;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ReviewRequestDTO {

    @NotNull(message = "Score is required")
    @DecimalMin(value = "1", message = "Score must be at least 1")
    @DecimalMax(value = "5", message = "Score must be at most 5")
    private BigDecimal score;

    @NotNull(message = "Reviewer username is required")
    private String reviewerUsername;

    private String comment;
}
