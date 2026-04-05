package pl.isigmas.kaucjapp.offers;

import org.springframework.boot.SpringApplication;

public class TestKaucjappApplication {

	public static void main(String[] args) {
		SpringApplication.from(OffersServiceApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
