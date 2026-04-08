package pl.isigmas.kaucjapp.users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.isigmas.kaucjapp.users.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
}