package pl.isigmas.kaucjapp.deposit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.deposit.model.DepositMachine;

@Repository
public interface DepositMachineRepository extends JpaRepository<DepositMachine, Long> {

}