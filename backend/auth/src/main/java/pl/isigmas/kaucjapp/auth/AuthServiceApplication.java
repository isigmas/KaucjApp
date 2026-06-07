package pl.isigmas.kaucjapp.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.ImportRuntimeHints;
import pl.isigmas.kaucjapp.auth.config.DtoRuntimeHints;

@SpringBootApplication
@EnableFeignClients
@EnableScheduling
@ImportRuntimeHints(DtoRuntimeHints.class)
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

}
