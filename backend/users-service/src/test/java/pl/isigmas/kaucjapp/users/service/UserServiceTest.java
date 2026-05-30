package pl.isigmas.kaucjapp.users.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.CreateUserDTO;
import pl.isigmas.kaucjapp.users.model.User;
import pl.isigmas.kaucjapp.users.model.UserStats;
import pl.isigmas.kaucjapp.users.repository.UserRepository;
import pl.isigmas.kaucjapp.users.repository.UserStatsRepository;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserStatsRepository userStatsRepository;

    @Mock
    private Logger logger;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_persistsUserAndInitialUserStats() {
        // Given
        CreateUserDTO dto = CreateUserDTO.builder()
                .id(42L)
                .username("alice")
                .firstName("Al")
                .lastName("Ice")
                .phone("123456789")
                .email("alice@example.com")
                .build();

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(dto.getUsername())).thenReturn(false);

        // When
        userService.createUser(dto.getId(), dto);

        // Then
        verify(userRepository, times(1)).save(any(User.class));
        verify(userStatsRepository, times(1)).save(any(UserStats.class));
    }
}
