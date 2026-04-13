package pl.isigmas.kaucjapp.deposit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.deposit.model.RetailNetwork;

import java.util.Optional;

@Repository
public interface RetailNetworkRepository extends JpaRepository<RetailNetwork, Long> {

    Optional<RetailNetwork> findByName(String name);
}
