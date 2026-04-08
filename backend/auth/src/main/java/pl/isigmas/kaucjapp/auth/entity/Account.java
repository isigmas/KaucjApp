package pl.isigmas.kaucjapp.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountRole;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull
    @Column(name = "username", unique = true, nullable = false)
    @Size(max = 100)
    private String username;

    @NotNull
    @Column(name = "email", unique = true, nullable = false)
    @Size(max = 255)
    private String email;


    @NotNull
    @Column(name = "password_hash", nullable = false)
    @Size(max = 255)
    private String passwordHash;

    @NotNull
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "role", columnDefinition = "account_role", nullable = false)
    private AccountRole role = AccountRole.USER;

    @NotNull
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", columnDefinition = "account_status", nullable = false)
    private AccountStatus status = AccountStatus.INACTIVE;
}
