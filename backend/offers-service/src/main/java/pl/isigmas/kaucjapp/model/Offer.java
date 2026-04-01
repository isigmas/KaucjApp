package pl.isigmas.kaucjapp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "offers")
@Data
@NoArgsConstructor
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "offer_id")
    private Long id;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "collector_id")
    private Long collectorId;

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
    private LocalDateTime timeCreated;

    @Column(name = "completed_at")
    private LocalDateTime timeCompleted;

    @OneToMany(mappedBy = "offer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OfferItem> items = new ArrayList<>();
}