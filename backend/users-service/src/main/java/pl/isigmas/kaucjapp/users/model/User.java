package pl.isigmas.kaucjapp.users.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {

    @Id
    @Column(name = "user_id", nullable = false)
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @Column(name="username")
    private String username;

    @NotNull
    @Column(name="first_name")
    private String firstName;

    @NotNull
    @Column(name="last_name")
    private String lastName;

    @NotNull
    @Column(name="email", unique = true, nullable = false)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant timeCreated;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAddress> addresses = new ArrayList<>();

    public List<UserAddress> getAddresses() {
        return List.copyOf(addresses);
    }

    public void addAddress(UserAddress address) {
        addresses.add(address);
        address.setUser(this);
    }

    public void removeAddress(UserAddress address) {
        addresses.remove(address);
        address.setUser(null);
    }
}