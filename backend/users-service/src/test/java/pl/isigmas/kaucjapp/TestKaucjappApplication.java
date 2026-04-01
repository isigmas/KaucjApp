package pl.isigmas.kaucjapp;

import org.springframework.boot.SpringApplication;

public class TestKaucjappApplication {

	public static void main(String[] args) {
		SpringApplication.from(KaucjappApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
