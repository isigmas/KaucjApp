package pl.isigmas.kaucjapp.users.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.isigmas.kaucjapp.users.DTO.DailyStatsCounts;
import pl.isigmas.kaucjapp.users.DTO.UserPeriodStatsDTO;
import pl.isigmas.kaucjapp.users.exception.InvalidStatsPeriodException;
import pl.isigmas.kaucjapp.users.exception.UserNotFoundException;
import pl.isigmas.kaucjapp.users.model.User;
import pl.isigmas.kaucjapp.users.repository.UserDailyStatsRepository;
import pl.isigmas.kaucjapp.users.repository.UserRepository;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserPeriodStatsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserDailyStatsRepository userDailyStatsRepository;

    @InjectMocks
    private UserPeriodStatsService userPeriodStatsService;

    @Test
    void getStatsForLastDays_sumsBucketsAndComputesTotals() {
        Long userId = 5L;
        int days = 30;
        LocalDate end = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = end.minusDays(days - 1L);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user(userId, "alice")));
        when(userDailyStatsRepository.getStatsForPeriod(eq(userId), eq(start), eq(end)))
                .thenReturn(aggregation(10L, 4L, 6L, 2L));

        UserPeriodStatsDTO result = userPeriodStatsService.getStatsForLastDays(userId, days);

        assertThat(result.getUserId()).isEqualTo(userId);
        assertThat(result.getUsername()).isEqualTo("alice");
        assertThat(result.getPeriodDays()).isEqualTo(30);
        assertThat(result.getFromDate()).isEqualTo(start);
        assertThat(result.getToDate()).isEqualTo(end);
        assertThat(result.getReturnedPlasticCount()).isEqualTo(10);
        assertThat(result.getReturnedCanCount()).isEqualTo(4);
        assertThat(result.getReturnedTotalCount()).isEqualTo(14);
        assertThat(result.getCollectedPlasticCount()).isEqualTo(6);
        assertThat(result.getCollectedCanCount()).isEqualTo(2);
        assertThat(result.getCollectedTotalCount()).isEqualTo(8);
    }

    @Test
    void getStatsForLastDays_unknownUser_throwsNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userPeriodStatsService.getStatsForLastDays(99L, 30))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void getStatsForLastDays_invalidDays_throws() {
        assertThatThrownBy(() -> userPeriodStatsService.getStatsForLastDays(1L, 0))
                .isInstanceOf(InvalidStatsPeriodException.class);
        assertThatThrownBy(() -> userPeriodStatsService.getStatsForLastDays(1L, 400))
                .isInstanceOf(InvalidStatsPeriodException.class);
    }

    @Test
    void getStatsForPeriod_customRange_usesInclusiveDayCount() {
        Long userId = 7L;
        LocalDate start = LocalDate.of(2026, 5, 1);
        LocalDate end = LocalDate.of(2026, 5, 7);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user(userId, "bob")));
        when(userDailyStatsRepository.getStatsForPeriod(userId, start, end))
                .thenReturn(aggregation(1L, 1L, 1L, 1L));

        UserPeriodStatsDTO result = userPeriodStatsService.getStatsForPeriod(userId, start, end);

        assertThat(result.getPeriodDays()).isEqualTo(7);
        assertThat(result.getFromDate()).isEqualTo(start);
        assertThat(result.getToDate()).isEqualTo(end);
        assertThat(result.getReturnedTotalCount()).isEqualTo(2);
    }

    private static User user(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setEmail(username + "@example.com");
        return user;
    }

    private static DailyStatsCounts aggregation(long rp, long rc, long cp, long cc) {
        return new DailyStatsCounts() {
            @Override
            public Long getReturnedPlastic() {
                return rp;
            }

            @Override
            public Long getReturnedCan() {
                return rc;
            }

            @Override
            public Long getCollectedPlastic() {
                return cp;
            }

            @Override
            public Long getCollectedCan() {
                return cc;
            }
        };
    }
}
