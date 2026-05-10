package pl.isigmas.kaucjapp.offers.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "offer_complaints")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OfferComplaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "complaint_id", nullable = false)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private Offer offer;

    @Column(name="complainant")
    @Enumerated(EnumType.STRING)
    private Complainant complainant;

    @Column(name="complaint_reason")
    @Enumerated(EnumType.STRING)
    private ComplaintReason complaintReason;

    @Column(name="message")
    private String message;

}
