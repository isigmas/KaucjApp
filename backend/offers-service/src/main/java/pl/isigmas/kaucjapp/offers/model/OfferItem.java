package pl.isigmas.kaucjapp.offers.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "offer_items")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"offer", "bottleType"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OfferItem {

    @EmbeddedId
    @EqualsAndHashCode.Include
    @Setter(AccessLevel.NONE)
    private OfferItemId id;

    @ManyToOne
    @MapsId("offerId")
    @JoinColumn(name = "offer_id")
    private Offer offer;

    @ManyToOne
    @MapsId("bottleId")
    @JoinColumn(name = "bottle_id")
    private BottleType bottleType;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer quantity;

    @NotNull
    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    public void setRelations(Offer offer, BottleType bottleType) {
        this.offer = offer;
        this.bottleType = bottleType;
        this.id = new OfferItemId(offer.getId(), bottleType.getId());
    }
}