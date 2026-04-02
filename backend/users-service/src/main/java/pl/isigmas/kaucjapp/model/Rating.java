package pl.isigmas.kaucjapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ratings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rating {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "avg_score", precision = 3, scale = 2)
    private BigDecimal avgScore=BigDecimal.ZERO;

    @Column(name = "feedback_count")
    private Integer feedbackCount=0;
}