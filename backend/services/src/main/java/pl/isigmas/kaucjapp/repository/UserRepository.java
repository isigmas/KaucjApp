package pl.isigmas.kaucjapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
}