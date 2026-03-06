package pl.isigmas.kaucjapp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
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

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne
    @JoinColumn(name = "collector_id")
    private User collector;

    @OneToOne(mappedBy = "offer", cascade = CascadeType.ALL)
    @PrimaryKeyJoinColumn
    private OfferInfo info;

    @OneToMany(mappedBy = "offer", cascade = CascadeType.ALL)
    private List<OfferCount> counts;
}