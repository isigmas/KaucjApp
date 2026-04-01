package pl.isigmas.kaucjapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "bottle_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BottleType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bottle_id")
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(name = "deposit_fee", nullable = false)
    private BigDecimal depositFee;
}