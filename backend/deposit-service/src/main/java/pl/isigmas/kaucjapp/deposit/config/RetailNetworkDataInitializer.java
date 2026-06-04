package pl.isigmas.kaucjapp.deposit.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.deposit.model.RetailNetwork;
import pl.isigmas.kaucjapp.deposit.repository.RetailNetworkRepository;

import java.util.List;

/**
 * Seeds {@code retail_networks} when the table is empty (local init.sql is not run on Azure).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RetailNetworkDataInitializer implements ApplicationRunner {

    private static final List<String> DEFAULT_NETWORKS = List.of(
            "Zabka",
            "Biedronka",
            "Lidl",
            "Kaufland",
            "Carrefour",
            "Auchan",
            "Aldi",
            "Dino",
            "Netto"
    );

    private final RetailNetworkRepository retailNetworkRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (retailNetworkRepository.count() > 0) {
            return;
        }

        for (String name : DEFAULT_NETWORKS) {
            retailNetworkRepository.save(retailNetwork(name));
        }
        log.info("Seeded default retail networks: {}", DEFAULT_NETWORKS);
    }

    private static RetailNetwork retailNetwork(String name) {
        RetailNetwork network = new RetailNetwork();
        network.setName(name);
        network.setIsActive(true);
        return network;
    }
}
