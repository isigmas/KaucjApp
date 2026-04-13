package pl.isigmas.kaucjapp.deposit.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Entity
@Table(name = "deposit_machines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DepositMachine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deposit_machine_id")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retail_network_id",nullable = false)
    private RetailNetwork retailNetwork;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private DepositMachineStatus status = DepositMachineStatus.AVAILABLE;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "address")
    private String address;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime timeCreated;

    @OneToMany(mappedBy = "depositMachine", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<OpeningHourRecord> openingHours = new java.util.ArrayList<>();

    public List<OpeningHourRecord> getItems() {
        return List.copyOf(openingHours);
    }

    public void addOpeningHour(OpeningHourRecord item) {
        openingHours.add(item);
        item.setDepositMachine(this);
    }

    public void removeOpeningHour(OpeningHourRecord item) {
        openingHours.remove(item);
    }

    public Optional<OpeningHourRecord> getHourByDay(Integer dayOfWeek) {
        return openingHours.stream()
                .filter(hour -> hour.getDayOfWeek().equals(dayOfWeek))
                .findFirst();
    }

}
