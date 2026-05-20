package pl.isigmas.kaucjapp.users.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;

@Entity
@Table(name = "user_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserStats {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "returned_plastic_count", nullable = false)
    private int returnedPlasticCount = 0;

    @Column(name = "returned_can_count", nullable = false)
    private int returnedCanCount = 0;

    @Column(name = "collected_plastic_count", nullable = false)
    private int collectedPlasticCount = 0;

    @Column(name = "collected_can_count", nullable = false)
    private int collectedCanCount = 0;

    @Formula("returned_plastic_count + returned_can_count")
    private int returnedTotalCount;

    @Formula("collected_plastic_count + collected_can_count")
    private int collectedTotalCount;
}