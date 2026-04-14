package pl.isigmas.kaucjapp.deposit.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import pl.isigmas.kaucjapp.deposit.DTO.OpeningHourDTO;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;

public class UniqueDaysOfWeekValidator implements ConstraintValidator<UniqueDaysOfWeek, List<OpeningHourDTO>> {

    @Override
    public boolean isValid(List<OpeningHourDTO> value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true;
        }
        var days = value.stream()
                .map(OpeningHourDTO::getDayOfWeek)
                .filter(Objects::nonNull)
                .toList();
        return days.size() == new HashSet<>(days).size();
    }
}
