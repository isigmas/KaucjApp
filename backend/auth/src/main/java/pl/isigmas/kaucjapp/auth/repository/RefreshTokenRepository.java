package pl.isigmas.kaucjapp.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.auth.entity.Account;
import pl.isigmas.kaucjapp.auth.entity.RefreshToken;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findAllByAccount(Account account);
}
