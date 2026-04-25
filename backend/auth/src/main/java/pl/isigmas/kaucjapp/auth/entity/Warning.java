package pl.isigmas.kaucjapp.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "warnings")
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Warning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "warning_id")
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @Column(name = "time")
    private Instant time =  Instant.now();

    @NotNull
    @Column(name = "message")
    private String message;
}
