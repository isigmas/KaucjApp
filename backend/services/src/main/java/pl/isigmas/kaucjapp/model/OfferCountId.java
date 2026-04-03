package pl.isigmas.kaucjapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferCountId implements Serializable {

    @Column(name = "offer_id")
    private Long offerId;

    @Column(name = "bottle_id")
    private Long bottleId;
}