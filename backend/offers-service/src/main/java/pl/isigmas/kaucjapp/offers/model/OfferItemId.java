package pl.isigmas.kaucjapp.offers.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class OfferItemId implements Serializable {

    @Column(name = "offer_id")
    private Long offerId;

    @Column(name = "bottle_id")
    private Long bottleId;
}