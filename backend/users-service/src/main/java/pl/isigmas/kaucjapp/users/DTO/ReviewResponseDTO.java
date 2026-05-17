package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ReviewResponseDTO {

    private Long reviewId;
    private Long reviewerId;
    private String reviewerUsername;
    private BigDecimal score;
    private String comment;
    private Instant createdAt;
    private Instant updatedAt;
}
