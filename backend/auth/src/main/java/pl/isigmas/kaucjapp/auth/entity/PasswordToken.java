package pl.isigmas.kaucjapp.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Entity
@Table(name = "reset_password_tokens")
@Getter
@Setter
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class PasswordToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "token_id")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Account account;

    @NotNull
    @Size(max = 255)
    @Column(name = "token_hash", nullable = false, unique = true)
    private String token;

    @NotNull
    @Column(name = "expires_at",  nullable = false)
    private Instant expirationDate;

    @Column(name = "created_at")
    private Instant creationDate = Instant.now();

    @NotNull
    @Column(name = "is_used", nullable = false)
    private boolean isUsed = false;
}
