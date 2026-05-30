package pl.isigmas.kaucjapp.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.DailyStatsCounts;
import pl.isigmas.kaucjapp.users.DTO.UserPeriodStatsDTO;
import pl.isigmas.kaucjapp.users.exception.InvalidStatsPeriodException;
import pl.isigmas.kaucjapp.users.exception.UserNotFoundException;
import pl.isigmas.kaucjapp.users.model.User;
import pl.isigmas.kaucjapp.users.repository.UserDailyStatsRepository;
import pl.isigmas.kaucjapp.users.repository.UserRepository;

import java.time.LocalDate;
import java.time.ZoneOffset;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPeriodStatsService {

    public static final int MAX_PERIOD_DAYS = 365;

    private final UserRepository userRepository;
    private final UserDailyStatsRepository userDailyStatsRepository;
    private final Logger logger;

    @Transactional(readOnly = true)
    public UserPeriodStatsDTO getStatsForLastDays(Long userId, int days) {
        validatePeriodDays(days);
        LocalDate end = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = end.minusDays(days - 1L);
        return getStatsForPeriod(userId, start, end, days);
    }

    @Transactional(readOnly = true)
    public UserPeriodStatsDTO getStatsForPeriod(Long userId, LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            log.warn("Invalid stats period: startDate {} is after endDate {}", startDate, endDate);
            logger.warn("Invalid stats period: startDate %s is after endDate %s".formatted(startDate, endDate));
            throw new InvalidStatsPeriodException("startDate must not be after endDate");
        }
        long inclusiveDays = endDate.toEpochDay() - startDate.toEpochDay() + 1;
        if (inclusiveDays > MAX_PERIOD_DAYS) {
            log.warn("Invalid stats period length: {} days (max {})", inclusiveDays, MAX_PERIOD_DAYS);
            logger.warn("Invalid stats period length: %d days (max %d)".formatted(inclusiveDays, MAX_PERIOD_DAYS));
            throw new InvalidStatsPeriodException("Period must not exceed " + MAX_PERIOD_DAYS + " days");
        }
        return getStatsForPeriod(userId, startDate, endDate, (int) inclusiveDays);
    }

    private UserPeriodStatsDTO getStatsForPeriod(Long userId, LocalDate startDate, LocalDate endDate, int periodDays) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found, ID: {}", userId);
                    logger.warn("User not found, ID: %d".formatted(userId));
                    return new UserNotFoundException(userId);
                });

        DailyStatsCounts aggregation = userDailyStatsRepository.getStatsForPeriod(userId, startDate, endDate);

        long returnedPlastic = nullSafe(aggregation.getReturnedPlastic());
        long returnedCan = nullSafe(aggregation.getReturnedCan());
        long collectedPlastic = nullSafe(aggregation.getCollectedPlastic());
        long collectedCan = nullSafe(aggregation.getCollectedCan());

        return UserPeriodStatsDTO.builder()
                .userId(userId)
                .username(user.getUsername())
                .profilePictureUrl(user.getProfilePictureUrl())
                .periodDays(periodDays)
                .fromDate(startDate)
                .toDate(endDate)
                .returnedPlasticCount(returnedPlastic)
                .returnedCanCount(returnedCan)
                .returnedTotalCount(returnedPlastic + returnedCan)
                .collectedPlasticCount(collectedPlastic)
                .collectedCanCount(collectedCan)
                .collectedTotalCount(collectedPlastic + collectedCan)
                .build();
    }

    private void validatePeriodDays(int days) {
        if (days < 1 || days > MAX_PERIOD_DAYS) {
            log.warn("Invalid stats period days: {} (allowed 1-{})", days, MAX_PERIOD_DAYS);
            logger.warn("Invalid stats period days: %d (allowed 1-%d)".formatted(days, MAX_PERIOD_DAYS));
            throw new InvalidStatsPeriodException(
                    "days must be between 1 and " + MAX_PERIOD_DAYS + ", got: " + days
            );
        }
    }

    private static long nullSafe(Long value) {
        return value == null ? 0L : value;
    }
}
