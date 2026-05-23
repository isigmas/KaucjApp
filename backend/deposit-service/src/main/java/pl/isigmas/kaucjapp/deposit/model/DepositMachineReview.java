package pl.isigmas.kaucjapp.deposit.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "deposit_machines_reviews")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DepositMachineReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id", nullable = false)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "deposit_machine_id", nullable = false)
    private Long depositMachineId;

    @Column(name = "reviewer_id")
    private Long reviewerId;

    @Column(name = "reviewer_username")
    private Long reviewerUsername;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal score;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
