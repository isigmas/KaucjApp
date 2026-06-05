package pl.isigmas.kaucjapp.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.isigmas.kaucjapp.auth.entity.ActivationToken;

import java.util.Optional;

public interface ActivationTokenRepository extends JpaRepository<ActivationToken, Long> {
    @Query("SELECT t FROM ActivationToken t JOIN FETCH t.account WHERE t.token = :token")
    Optional<ActivationToken> findByToken(@Param("token") String token);
}
