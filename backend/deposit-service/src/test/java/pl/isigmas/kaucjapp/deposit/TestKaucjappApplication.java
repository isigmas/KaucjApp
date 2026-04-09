package pl.isigmas.kaucjapp.deposit;

import org.springframework.boot.SpringApplication;
import pl.isigmas.kaucjapp.deposit.TestcontainersConfiguration;

public class TestKaucjappApplication {

	public static void main(String[] args) {
		SpringApplication.from(DepositServiceApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
