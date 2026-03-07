package pl.isigmas.kaucjapp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    private String name;
    private String surname;
    private String username;
    private String phoneNumber;
    private String email;
    private String defaultAddress;
    private BigDecimal defaultLatitude;
    private BigDecimal defaultLongitude;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Rating rating;
}