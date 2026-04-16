package pl.isigmas.kaucjapp.auth.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.auth.entity.Account;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountRole;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;
import pl.isigmas.kaucjapp.auth.repository.AccountRepository;
import pl.isigmas.kaucjapp.auth.security.Encoder;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAccountInitializer implements CommandLineRunner {

    @Value("${app.admin.default-username}")
    private String adminUsername;

    @Value("${app.admin.default-email}")
    private String adminEmail;

    @Value("${app.admin.default-password}")
    private String adminPassword;

    private final AccountRepository accountRepository;
    private final Encoder encoder;

    @Override
    public void run(String @NonNull ... args) {
        if (accountRepository.findByRole(AccountRole.ADMIN).isEmpty()) {
            Account admin = Account.builder()
                            .username(adminUsername)
                            .email(adminEmail)
                            .passwordHash(encoder.hashPassword(adminPassword))
                            .role(AccountRole.ADMIN)
                            .status(AccountStatus.ACTIVE)
                            .build();
            accountRepository.save(admin);
            log.info("Admin account has been created");
        } else {
            log.info("Admin account has already been created, skipping");
        }
    }
}
