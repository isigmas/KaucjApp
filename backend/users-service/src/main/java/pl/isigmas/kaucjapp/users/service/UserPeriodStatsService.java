package pl.isigmas.kaucjapp.users.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.users.DTO.DailyStatsCounts;
import pl.isigmas.kaucjapp.users.DTO.UserPeriodStatsDTO;
import pl.isigmas.kaucjapp.users.exception.InvalidStatsPeriodException;
import pl.isigmas.kaucjapp.users.exception.UserNotFoundException;
import pl.isigmas.kaucjapp.users.repository.UserDailyStatsRepository;
import pl.isigmas.kaucjapp.users.repository.UserRepository;

import java.time.LocalDate;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class UserPeriodStatsService {

    public static final int MAX_PERIOD_DAYS = 365;

    private final UserRepository userRepository;
    private final UserDailyStatsRepository userDailyStatsRepository;

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
            throw new InvalidStatsPeriodException("startDate must not be after endDate");
        }
        long inclusiveDays = endDate.toEpochDay() - startDate.toEpochDay() + 1;
        if (inclusiveDays > MAX_PERIOD_DAYS) {
            throw new InvalidStatsPeriodException("Period must not exceed " + MAX_PERIOD_DAYS + " days");
        }
        return getStatsForPeriod(userId, startDate, endDate, (int) inclusiveDays);
    }

    private UserPeriodStatsDTO getStatsForPeriod(Long userId, LocalDate startDate, LocalDate endDate, int periodDays) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }

        DailyStatsCounts aggregation = userDailyStatsRepository.getStatsForPeriod(userId, startDate, endDate);

        long returnedBottles = nullSafe(aggregation.getReturnedBottle());
        long returnedCans = nullSafe(aggregation.getReturnedCan());
        long collectedBottles = nullSafe(aggregation.getCollectedBottle());
        long collectedCans = nullSafe(aggregation.getCollectedCan());

        return UserPeriodStatsDTO.builder()
                .userId(userId)
                .periodDays(periodDays)
                .fromDate(startDate)
                .toDate(endDate)
                .returnedBottleCount(returnedBottles)
                .returnedCanCount(returnedCans)
                .returnedTotalCount(returnedBottles + returnedCans)
                .collectedBottleCount(collectedBottles)
                .collectedCanCount(collectedCans)
                .collectedTotalCount(collectedBottles + collectedCans)
                .build();
    }

    private static void validatePeriodDays(int days) {
        if (days < 1 || days > MAX_PERIOD_DAYS) {
            throw new InvalidStatsPeriodException(
                    "days must be between 1 and " + MAX_PERIOD_DAYS + ", got: " + days
            );
        }
    }

    private static long nullSafe(Long value) {
        return value == null ? 0L : value;
    }
}
