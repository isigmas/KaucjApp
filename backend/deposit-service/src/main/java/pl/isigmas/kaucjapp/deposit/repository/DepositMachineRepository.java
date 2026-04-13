package pl.isigmas.kaucjapp.deposit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.deposit.model.DepositMachine;

import java.util.List;

@Repository
public interface DepositMachineRepository extends JpaRepository<DepositMachine, Long> {

    @Override
    @EntityGraph(attributePaths = {"retailNetwork", "openingHours"})
    List<DepositMachine> findAll();

    @Query(value = "SELECT * FROM deposit_machines " +
            "WHERE status = 'OPEN' " +
            "AND point(longitude, latitude) <@ box(point(:swLon, :swLat), point(:neLon, :neLat))",
            nativeQuery = true)
    List<DepositMachine> findOpenOffersInBoundingBox(
            @Param("swLat") double swLat,
            @Param("swLon") double swLon,
            @Param("neLat") double neLat,
            @Param("neLon") double neLon
    );
}