package pl.isigmas.kaucjapp.notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportRuntimeHints;
import pl.isigmas.kaucjapp.notification.config.DtoRuntimeHints;

@ImportRuntimeHints(DtoRuntimeHints.class)
@SpringBootApplication
public class NotificationServiceApplication {

    static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}
