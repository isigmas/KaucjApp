package pl.isigmas.kaucjapp.deposit.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.isigmas.kaucjapp.deposit.model.DepositMachine;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepositMachineRepository extends JpaRepository<DepositMachine, Long> {

    @Override
    @EntityGraph(attributePaths = {"retailNetwork", "openingHours"})
    List<DepositMachine> findAll();

    @Query(value = "SELECT deposit_machine_id FROM deposit_machines " +
            "WHERE point(longitude, latitude) <@ box(point(:swLon, :swLat), point(:neLon, :neLat))",
            nativeQuery = true)
    List<Long> findIdsInBoundingBox(
            @Param("swLat") double swLat,
            @Param("swLon") double swLon,
            @Param("neLat") double neLat,
            @Param("neLon") double neLon
    );

    @EntityGraph(attributePaths = {"retailNetwork", "openingHours"})
    @Query("SELECT d FROM DepositMachine d WHERE d.id IN :ids")
    List<DepositMachine> findAllByIdInWithAssociations(@Param("ids") List<Long> ids);

    @EntityGraph(attributePaths = {"retailNetwork", "openingHours"})
    @Query("SELECT d FROM DepositMachine d WHERE d.id = :id")
    Optional<DepositMachine> findWithOpeningHoursById(@Param("id") Long id);
}
