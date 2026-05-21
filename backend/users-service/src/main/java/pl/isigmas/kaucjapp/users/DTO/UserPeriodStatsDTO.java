package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserPeriodStatsDTO {

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("username")
    private String username;

    @JsonProperty("profile_picture_url")
    private String profilePictureUrl;

    @JsonProperty("period_days")
    private int periodDays;

    @JsonProperty("from_date")
    private LocalDate fromDate;

    @JsonProperty("to_date")
    private LocalDate toDate;

    @JsonProperty("returned_bottle_count")
    private long returnedPlasticCount;

    @JsonProperty("returned_can_count")
    private long returnedCanCount;

    @JsonProperty("returned_total_count")
    private long returnedTotalCount;

    @JsonProperty("collected_bottle_count")
    private long collectedPlasticCount;

    @JsonProperty("collected_can_count")
    private long collectedCanCount;

    @JsonProperty("collected_total_count")
    private long collectedTotalCount;
}
