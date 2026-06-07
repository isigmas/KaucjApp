package pl.isigmas.kaucjapp.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.isigmas.kaucjapp.auth.entity.PasswordToken;

import java.util.Optional;

public interface PasswordTokenRepository extends JpaRepository<PasswordToken, Long> {
    @Query("SELECT t FROM PasswordToken t JOIN FETCH t.account WHERE t.token = :token")
    Optional<PasswordToken> findByToken(@Param("token") String token);
}
