package pl.isigmas.kaucjapp.offers;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.scheduling.annotation.EnableScheduling;
import pl.isigmas.kaucjapp.offers.config.NativeRuntimeHints;

@SpringBootApplication
@EnableScheduling
@ImportRuntimeHints(NativeRuntimeHints.class)
public class OffersServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OffersServiceApplication.class, args);
    }

}
