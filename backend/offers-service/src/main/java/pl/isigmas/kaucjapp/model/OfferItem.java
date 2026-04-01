package pl.isigmas.kaucjapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "offer_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferItem {

    @EmbeddedId
    private OfferItemId id = new OfferItemId();

    @ManyToOne
    @MapsId("offerId")
    @JoinColumn(name = "offer_id")
    private Offer offer;

    @ManyToOne
    @MapsId("bottleId")
    @JoinColumn(name = "bottle_id")
    private BottleType bottleType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;
}