package pl.isigmas.kaucjapp.users.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsDTO {

    @JsonProperty("returned_bottle_count")
    private Long returnedPlasticCount;

    @JsonProperty("returned_can_count")
    private Long returnedCanCount;

    @JsonProperty("returned_total_count")
    private Long returnedTotalCount;

}
