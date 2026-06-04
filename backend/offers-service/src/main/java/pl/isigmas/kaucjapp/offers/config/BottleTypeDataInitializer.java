package pl.isigmas.kaucjapp.offers.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.offers.model.BottleType;
import pl.isigmas.kaucjapp.offers.repository.BottleTypeRepository;

import java.math.BigDecimal;

/**
 * Seeds {@code bottle_types} when the table is empty (local init.sql is not run on Azure).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BottleTypeDataInitializer implements ApplicationRunner {

    private final BottleTypeRepository bottleTypeRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (bottleTypeRepository.count() > 0) {
            return;
        }

        bottleTypeRepository.save(bottleType("plastic", "0.50"));
        bottleTypeRepository.save(bottleType("can", "0.50"));
        log.info("Seeded default bottle types: plastic, can");
    }

    private static BottleType bottleType(String name, String depositFee) {
        BottleType type = new BottleType();
        type.setName(name);
        type.setDepositFee(new BigDecimal(depositFee));
        return type;
    }
}
