package pl.isigmas.kaucjapp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.DTO.RatingDTO;
import pl.isigmas.kaucjapp.model.Rating;
import pl.isigmas.kaucjapp.model.User;
import pl.isigmas.kaucjapp.repository.RatingRepository;
import pl.isigmas.kaucjapp.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addRating(Long userId, int score) {
        log.info("Dodawanie oceny {} dla użytkownika ID: {}", score, userId);

        Rating rating = ratingRepository.findById(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika o ID: " + userId));
                    return Rating.builder()
                            .userId(userId)
                            .user(user)
                            .currentAvg(BigDecimal.ZERO)
                            .numberOfFeedbacks(0L)
                            .build();
                });

        BigDecimal currentAvg = rating.getCurrentAvg();
        long oldCount = rating.getNumberOfFeedbacks();
        long newCount = oldCount + 1;

        BigDecimal currentTotalSum = currentAvg.multiply(BigDecimal.valueOf(oldCount));
        BigDecimal newTotalSum = currentTotalSum.add(BigDecimal.valueOf(score));
        BigDecimal newAvg = newTotalSum.divide(BigDecimal.valueOf(newCount), 2, RoundingMode.HALF_UP);

        rating.setCurrentAvg(newAvg);
        rating.setNumberOfFeedbacks(newCount);

        ratingRepository.save(rating);
        log.info("Nowa średnia dla użytkownika {}: {} (liczba ocen: {})", userId, newAvg, newCount);
    }

    public RatingDTO getRatingDTO(Long userId) {
        return ratingRepository.findById(userId)
                .map(this::mapToDTO)
                .orElse(null);
    }

    private RatingDTO mapToDTO(Rating rating) {
        return RatingDTO.builder()
                .userId(rating.getUserId())
                .currentAvg(rating.getCurrentAvg())
                .numberOfFeedbacks(rating.getNumberOfFeedbacks())
                .build();
    }
}