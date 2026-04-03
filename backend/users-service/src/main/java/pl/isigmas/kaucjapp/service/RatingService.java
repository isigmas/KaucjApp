package pl.isigmas.kaucjapp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;

import pl.isigmas.kaucjapp.DTO.RatingDTO;
import pl.isigmas.kaucjapp.model.Rating;
import pl.isigmas.kaucjapp.repository.RatingRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;

    @Transactional
    public void addRating(Long userId, int score, Long raterId) {
        log.info("Dodawanie oceny {} dla użytkownika ID: {}", score, userId);

        if (userId.equals(raterId)) {
            throw new SecurityException("Cannot rate yourself");
        }

        Rating rating = ratingRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        BigDecimal currentAvg = rating.getAvgScore();
        int oldCount = rating.getFeedbackCount();
        int newCount = oldCount + 1;

        BigDecimal currentTotalSum = currentAvg.multiply(BigDecimal.valueOf(oldCount));
        BigDecimal newTotalSum = currentTotalSum.add(BigDecimal.valueOf(score));
        BigDecimal newAvg = newTotalSum.divide(BigDecimal.valueOf(newCount), 2, RoundingMode.HALF_UP);

        rating.setAvgScore(newAvg);
        rating.setFeedbackCount(newCount);

        ratingRepository.save(rating);
        log.info("Nowa średnia dla użytkownika {}: {} (liczba ocen: {})", userId, newAvg, newCount);
    }

    @Transactional(readOnly = true)
    public RatingDTO getRatingDTO(Long userId) {
        return ratingRepository.findById(userId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Reviews not found for user ID: " + userId));
    }

    private RatingDTO mapToDTO(Rating rating) {
        RatingDTO dto = new RatingDTO();
        dto.setUserId(rating.getUserId());
        dto.setAvgScore(rating.getAvgScore());
        dto.setFeedbackCount(rating.getFeedbackCount());
        return dto;
    }
}