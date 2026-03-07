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

    @JsonProperty("current_avg")
    private BigDecimal currentAvg;

    @JsonProperty("number_of_feedbacks")
    private Long numberOfFeedbacks;
}