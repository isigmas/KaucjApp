package pl.isigmas.kaucjapp.offers.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "offers")
@Getter
@Setter
@ToString(exclude = "items")
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "offer_id", nullable = false)
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @Column(name = "creator_id")
    private Long creatorId;

    @Column(name = "collector_id")
    private Long collectorId;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private OfferStatus status = OfferStatus.OPEN;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @Column(name = "pickup_address")
    private String pickupAddress;

    @Column(name = "pickup_instructions")
    private String pickupInstructions;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant timeCreated;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "reserved_at")
    private Instant reservedAt;

    @Column(name = "reserved_to")
    private Instant reservedTo;

    @Column(name = "completed_at")
    private Instant timeCompleted;

    @Column(name = "creator_confirmed", nullable = false)
    private Boolean creatorConfirmed = false;

    @Column(name = "collector_confirmed", nullable = false)
    private Boolean collectorConfirmed = false;

    @Column(name = "confirmation_deadline")
    private Instant confirmationDeadline;

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "offer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OfferItem> items = new ArrayList<>();

    public List<OfferItem> getItems() {
        return List.copyOf(items);
    }

    public void addItem(OfferItem item) {
        items.add(item);
        item.setOffer(this);
    }

    public void removeItem(OfferItem item) {
        items.remove(item);
        item.setOffer(null);
    }
}