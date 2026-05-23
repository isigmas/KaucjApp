package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ReviewCheckResponseDTO {
    private boolean alreadyReviewed;
    private ReviewResponseDTO review;
}