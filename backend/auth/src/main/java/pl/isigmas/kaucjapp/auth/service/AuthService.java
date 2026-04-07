package pl.isigmas.kaucjapp.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.auth.client.UserClient;
import pl.isigmas.kaucjapp.auth.dto.request.LoginCredentials;
import pl.isigmas.kaucjapp.auth.dto.request.User;
import pl.isigmas.kaucjapp.auth.dto.request.UsersServiceUser;
import pl.isigmas.kaucjapp.auth.entity.Account;
import pl.isigmas.kaucjapp.auth.entity.RefreshToken;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;
import pl.isigmas.kaucjapp.auth.exception.AccountNotActiveException;
import pl.isigmas.kaucjapp.auth.exception.InvalidCredentialsException;
import pl.isigmas.kaucjapp.auth.exception.TokenNotFoundException;
import pl.isigmas.kaucjapp.auth.repository.AccountRepository;
import pl.isigmas.kaucjapp.auth.repository.RefreshTokenRepository;
import pl.isigmas.kaucjapp.auth.security.Encoder;

import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    private final Encoder encoder;
    private final UserClient userClient;

    @Transactional
    public void create(User newUser) {

        Account newAccount = new Account();
        newAccount.setUsername(newUser.getUsername());
        newAccount.setEmail(newUser.getEmail());
        newAccount.setPasswordHash(encoder.hashPassword(newUser.getPassword()));

        Account createdAccount = accountRepository.save(newAccount);

        UsersServiceUser newUsersServiceUser = new UsersServiceUser();
        newUsersServiceUser.setId(createdAccount.getId());
        newUsersServiceUser.setUsername(newUser.getUsername());
        newUsersServiceUser.setEmail(newUser.getEmail());
        newUsersServiceUser.setPhone(newUser.getPhone());
        newUsersServiceUser.setFirstName(newUser.getFirstName());
        newUsersServiceUser.setLastName(newUser.getLastName());

        userClient.create(newUsersServiceUser);
    }

    @Transactional
    public void logout(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(TokenNotFoundException::new);

        refreshToken.setRevoked(true);
    }

    @Transactional
    public String login(LoginCredentials loginCredentials) {

        String identifier = loginCredentials.getIdentifier();
        Account account = accountRepository.findByUsernameOrEmail(identifier, identifier)
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
}
