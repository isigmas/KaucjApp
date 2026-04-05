package pl.isigmas.kaucjapp.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.auth.entity.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {
}
