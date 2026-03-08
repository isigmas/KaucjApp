package pl.isigmas.kaucjapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ratings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rating {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "current_avg", precision = 9, scale = 6)
    private BigDecimal currentAvg;

    @Column(name = "number_of_feedbacks")
    private Long numberOfFeedbacks;
}