package pl.isigmas.kaucjapp.notification.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import pl.isigmas.kaucjapp.notification.util.TemplateType;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "email_retry_tasks")
@Getter
@Setter
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class EmailRetryTask {

    @Id
    @Column(name = "task_id")
    @EqualsAndHashCode.Include
    private UUID id;

    @NotBlank
    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @NotBlank
    @Column(name = "username", nullable = false)
    private String username;

    @NotBlank
    @Column(name = "subject", nullable = false)
    private String subject;

    @NotBlank
    @Column(name = "message", nullable = false)
    private String message;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", nullable = false)
    private TemplateType templateType;

    @NotNull
    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @NotNull
    @Column(name = "next_attempt_at", nullable = false)
    private Instant nextAttemptAt;

    @NotNull
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
