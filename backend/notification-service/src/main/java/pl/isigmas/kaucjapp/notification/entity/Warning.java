package pl.isigmas.kaucjapp.notification.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "warnings")
@Getter
@Setter
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class Warning {

    @Id
    @Column(name = "warning_id")
    @EqualsAndHashCode.Include
    private UUID id;

    @NotNull
    @Column(name = "time")
    @Builder.Default
    private Instant time = Instant.now();

    @NotNull
    @Column(name = "message")
    private String message;
}
