package pl.isigmas.kaucjapp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "bottle_price")
@Data
@NoArgsConstructor
public class BottlePrice {

    @Id
    @Column(name = "bottle_id")
    private Long id;

    private BigDecimal price;
    private BigDecimal fee;
}