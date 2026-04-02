package pl.isigmas.kaucjapp.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingDTO {

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("avg_score")
    private BigDecimal avgScore;

    @JsonProperty("feedback_count")
    private Integer feedbackCount;
}