package pl.isigmas.kaucjapp.users.support;

import org.springframework.boot.SpringApplication;
import pl.isigmas.kaucjapp.users.UsersServiceApplication;

public class TestKaucjappApplication {

    public static void main(String[] args) {
        SpringApplication.from(UsersServiceApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
