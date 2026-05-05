package pl.isigmas.kaucjapp.users;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportRuntimeHints;
import pl.isigmas.kaucjapp.users.config.DtoRuntimeHints;

@ImportRuntimeHints(DtoRuntimeHints.class)
@SpringBootApplication
public class UsersServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UsersServiceApplication.class, args);
    }

}
