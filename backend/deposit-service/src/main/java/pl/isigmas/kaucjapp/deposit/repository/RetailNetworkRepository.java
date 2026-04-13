package pl.isigmas.kaucjapp.deposit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.deposit.model.RetailNetwork;

@Repository
public interface RetailNetworkRepository extends JpaRepository<RetailNetwork, Long> {

    RetailNetwork findBy(String name);
}