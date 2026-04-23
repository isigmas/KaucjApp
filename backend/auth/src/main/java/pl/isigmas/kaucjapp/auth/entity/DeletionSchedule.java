package pl.isigmas.kaucjapp.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Entity
@Table(name ="deletion_schedule")
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DeletionSchedule {

    @Id
    private Long accountId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Account account;

    @NotNull
    @Column(name = "scheduled_deletion_date", nullable = false)
    private Instant scheduledDeletionDate;

    @NotNull
    @Column(name = "backup_username")
    private String backupUsername;

    @NotNull
    @Column(name = "backup_email")
    private String backupEmail;
}
