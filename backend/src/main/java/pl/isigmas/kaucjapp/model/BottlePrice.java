package pl.isigmas.kaucjapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "bottle_price")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BottlePrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bottle_id")
    private Long id;

    private BigDecimal price;
    private BigDecimal fee;
}
