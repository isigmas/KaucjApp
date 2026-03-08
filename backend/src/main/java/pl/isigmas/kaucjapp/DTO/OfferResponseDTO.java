package pl.isigmas.kaucjapp.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OfferResponseDTO {

    @JsonProperty("offer_id")
    private Long offerId;

    private String status;
    private Double latitude;
    private Double longitude;

    @JsonProperty("address")
    private String pickupAddress;

    @JsonProperty("pickup_info")
    private String pickupInstructions;

    private UserDTO user;
    private List<ItemDTO> items;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;


    @Data
    @Builder
    public static class UserDTO {
        @JsonProperty("user_id")
        private Long userId;
        private String username;
    }

    @Data
    @Builder
    public static class ItemDTO {
        @JsonProperty("bottle_id")
        private Long bottleId;
        private Integer quantity;
        private Double price;
        private Double fee;
    }

}