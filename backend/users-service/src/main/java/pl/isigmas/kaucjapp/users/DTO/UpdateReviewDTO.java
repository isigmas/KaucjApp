package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UpdateReviewDTO {

    @DecimalMin(value = "1", message = "Score must be at least 1")
    @DecimalMax(value = "5", message = "Score must be at most 5")
    private BigDecimal score;

    private String comment;
}
