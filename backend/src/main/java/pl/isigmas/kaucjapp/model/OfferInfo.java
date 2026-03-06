package pl.isigmas.kaucjapp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "offer_info")
@Data
@NoArgsConstructor
public class OfferInfo {

    @Id
    @Column(name = "offer_id")
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "offer_id")
    private Offer offer;

    private String pickupAddress;
    private String pickupInstructions;

    @Enumerated(EnumType.STRING)
    private OfferStatus status = OfferStatus.OPEN;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timeCreated;

    private LocalDateTime timeCompleted;
}