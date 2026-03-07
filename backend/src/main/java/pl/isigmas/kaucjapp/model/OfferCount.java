package pl.isigmas.kaucjapp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "counts")
@Data
@NoArgsConstructor
public class OfferCount {

    @EmbeddedId
    private OfferCountId id = new OfferCountId();

    @ManyToOne
    @MapsId("offerId")
    @JoinColumn(name = "offer_id")
    private Offer offer;

    @ManyToOne
    @MapsId("bottleId")
    @JoinColumn(name = "bottle_id")
    private BottlePrice bottlePrice;

    private Integer quantity = 0;
}