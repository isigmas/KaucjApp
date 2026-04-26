package pl.isigmas.kaucjapp.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.auth.entity.PasswordToken;

public interface PasswordTokenRepository extends JpaRepository<PasswordToken, Long> {
     PasswordToken findByToken(String token);
}
