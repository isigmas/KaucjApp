package pl.isigmas.kaucjapp.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.auth.client.NotificationClient;
import pl.isigmas.kaucjapp.auth.client.UserClient;
import pl.isigmas.kaucjapp.auth.dto.request.LoginCredentials;
import pl.isigmas.kaucjapp.auth.dto.request.MailRequest;
import pl.isigmas.kaucjapp.auth.dto.request.User;
import pl.isigmas.kaucjapp.auth.dto.request.UsersServiceUser;
import pl.isigmas.kaucjapp.auth.entity.*;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountRole;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;
import pl.isigmas.kaucjapp.auth.exception.*;
import pl.isigmas.kaucjapp.auth.repository.*;
import pl.isigmas.kaucjapp.auth.security.Encoder;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.EnumSet;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtService jwtService;
    private final TokenService tokenService;

    private final AccountRepository accountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ActivationTokenRepository activationTokenRepository;
    private final DeletionScheduleRepository deletionScheduleRepository;
    private final WarningRepository warningRepository;
    private final PasswordTokenRepository passwordTokenRepository;

    private final UserClient userClient;
    private final NotificationClient notificationClient;

    private final Encoder encoder;

    @Value("${IT_SECRET}")
    private String itSecret;

    @Transactional
    public void create(User newUser) {
        accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(newUser.getUsername(), newUser.getEmail())
                .ifPresent(_ -> {
                    throw new AccountAlreadyExistsException("Account with given username or email already exists");
                });

        Account newAccount = new Account();
        newAccount.setUsername(newUser.getUsername().trim());
        newAccount.setEmail(newUser.getEmail().toLowerCase().trim());
        newAccount.setPasswordHash(encoder.hashPassword(newUser.getPassword()));

        Account createdAccount = accountRepository.save(newAccount);

        UsersServiceUser newUsersServiceUser = new UsersServiceUser();
        newUsersServiceUser.setId(createdAccount.getId());
        newUsersServiceUser.setUsername(newUser.getUsername().trim());
        newUsersServiceUser.setEmail(newUser.getEmail().toLowerCase().trim());
        newUsersServiceUser.setPhone(newUser.getPhone());
        newUsersServiceUser.setFirstName(newUser.getFirstName().trim());
        newUsersServiceUser.setLastName(newUser.getLastName().trim());

        userClient.create(newUsersServiceUser, itSecret);

        String token = tokenService.generateBase64();
        ActivationToken activationToken = ActivationToken.builder()
                .account(createdAccount)
                .token(encoder.hashToken(token))
                .expirationDate(Instant.now().plus(Duration.ofDays(1)))
                .build();

        activationTokenRepository.save(activationToken);

        MailRequest mailRequest = MailRequest.builder()
                .emailTo(newUser.getEmail())
                .message(token)
                .build();
        
        notificationClient.sendWelcomeEmail(mailRequest);
    }

    @Transactional
    public void logout(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(TokenNotFoundException::new);

        if (refreshToken.getExpirationDate().before(new Date())) {
            throw new ExpiredTokenException(refreshToken);
        }
        refreshToken.setRevoked(true);
    }

    @Transactional
    public String login(LoginCredentials loginCredentials) {

        String identifier = loginCredentials.getIdentifier().toLowerCase().trim();
        Account account = accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(InvalidCredentialsException::new);

        AccountStatus accountStatus = account.getStatus();
        if (accountStatus != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException(accountStatus);
        }

        if (!encoder.verifyPassword(loginCredentials.getPassword(), account.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String generatedToken = UUID.randomUUID().toString();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setAccount(account);
        refreshToken.setToken(generatedToken);
        refreshToken.setExpirationDate(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000));
        refreshToken.setDeviceInfo(loginCredentials.getDeviceInfo());
        refreshTokenRepository.save(refreshToken);

        return generatedToken;
    }

    @Transactional
    public void activate(String token) {

        ActivationToken activationToken = activationTokenRepository.findByToken(encoder.hashToken(token))
                .orElseThrow(TokenNotFoundException::new);

        if (activationToken.isUsed()) {
            throw new UsedTokenException();
        }

        if (activationToken.getExpirationDate().isBefore(Instant.now())) {
            throw new ExpiredTokenException(activationToken);
        }

        Account account = activationToken.getAccount();
        account.setStatus(AccountStatus.ACTIVE);

        activationToken.setUsed(true);
    }

    @Transactional
    public void suspend(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException(id));

        account.setStatus(AccountStatus.SUSPENDED);
    }

    @Transactional
    public void delete(Long id) {
        // Find account
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException(id));

        // Check account status
        if (EnumSet.of(AccountStatus.DELETED, AccountStatus.PENDING_DELETION).contains(account.getStatus())) {
            throw AccountAlreadyDeleted.of(account.getStatus());
        }

        if (account.getStatus() == AccountStatus.SUSPENDED) {
            log.warn("Attempt to delete a suspended account");

            Warning warning = Warning.builder()
                    .message("Attempt to delete a suspended account, id: " + id)
                    .build();

            warningRepository.save(warning);
        }

        // Logout from all devices
        refreshTokenRepository.findAllByAccount(account)
                .forEach(token -> token.setRevoked(true));

        // Anonymize account
        String seed = UUID.randomUUID().toString();

        String backupEmail = account.getEmail();
        account.setEmail(seed + "@deleted.user");

        String backupUsername = account.getUsername();
        account.setUsername("deleted#" + seed);

        userClient.delete(id, itSecret);

        // Schedule deletion
        DeletionSchedule deletionSchedule = DeletionSchedule.builder()
                        .account(account)
                        .scheduledDeletionDate(Instant.now().plus(Duration.ofDays(30)))
                        .backupUsername(backupUsername)
                        .backupEmail(backupEmail)
                        .build();
        deletionScheduleRepository.save(deletionSchedule);

        account.setStatus(AccountStatus.PENDING_DELETION);
    }

    @Transactional
    public void sendResetPasswordEmail(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new AccountNotFoundException(email));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException(account.getStatus());
        }

        String token = tokenService.generateBase64();
        PasswordToken passwordToken = PasswordToken.builder()
                .account(account)
                .token(encoder.hashToken(token))
                .expirationDate(Instant.now().plus(Duration.ofHours(1)))
                .build();
        passwordTokenRepository.save(passwordToken);

        MailRequest mailRequest = MailRequest.builder()
                .emailTo(email)
                .message(token)
                .build();

        notificationClient.sendResetPasswordEmail(mailRequest);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordToken passwordToken = passwordTokenRepository.findByToken(encoder.hashToken(token))
                .orElseThrow(TokenNotFoundException::new);

        if (passwordToken.isUsed()) {
            throw new UsedTokenException();
        }

        if (passwordToken.getExpirationDate().isBefore(Instant.now())) {
            throw new ExpiredTokenException(passwordToken);
        }

        passwordToken.getAccount().setPasswordHash(encoder.hashPassword(newPassword));
        passwordToken.setUsed(true);
    }

    @Transactional(readOnly = true)
    public String generateJWT(String refreshTokenStr) {

        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(TokenNotFoundException::new);

        if (refreshToken.isRevoked()) {
            throw new RevokedTokenException();
        }

        if (refreshToken.getExpirationDate().before(new Date())) {
            throw new ExpiredTokenException(refreshToken);
        }

        Account account = refreshToken.getAccount();

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException(account.getStatus());
        }

        Long userId = account.getId();
        AccountRole role = account.getRole();

        return jwtService.generateAccessToken(userId.toString(), role.toString());
    }
}
