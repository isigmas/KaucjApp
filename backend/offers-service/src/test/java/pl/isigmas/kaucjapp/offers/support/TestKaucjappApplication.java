package pl.isigmas.kaucjapp.offers.support;

import org.springframework.boot.SpringApplication;
import pl.isigmas.kaucjapp.offers.OffersServiceApplication;

public class TestKaucjappApplication {

    public static void main(String[] args) {
        SpringApplication.from(OffersServiceApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
