package pl.isigmas.kaucjapp.users.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "processed_offer_events")
public class ProcessedOfferEvent {

    @Id
    @Column(name = "offer_id")
    private Long offerId;

    @Column(name = "processed_at", nullable = false)
    private Instant processedAt;
}
