package pl.isigmas.kaucjapp.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.isigmas.kaucjapp.auth.entity.Account;
import pl.isigmas.kaucjapp.auth.entity.RefreshToken;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    @Query("SELECT t FROM RefreshToken t JOIN FETCH t.account WHERE t.token = :token")
    Optional<RefreshToken> findByToken(@Param("token") String token);

    List<RefreshToken> findAllByAccount(Account account);
}
