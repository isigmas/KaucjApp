package pl.isigmas.kaucjapp.deposit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.kafka.annotation.EnableKafka;
import pl.isigmas.kaucjapp.deposit.config.NativeRuntimeHints;

@EnableKafka
@SpringBootApplication
@ImportRuntimeHints(NativeRuntimeHints.class)
public class DepositServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DepositServiceApplication.class, args);
    }

}
