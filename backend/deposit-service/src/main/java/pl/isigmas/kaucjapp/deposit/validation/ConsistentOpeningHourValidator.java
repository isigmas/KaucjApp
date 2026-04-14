package pl.isigmas.kaucjapp.deposit.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import pl.isigmas.kaucjapp.deposit.DTO.OpeningHourDTO;

public class ConsistentOpeningHourValidator implements ConstraintValidator<ConsistentOpeningHour, OpeningHourDTO> {

    @Override
    public boolean isValid(OpeningHourDTO value, ConstraintValidatorContext context) {
        if (value == null || value.getOpenTime() == null || value.getCloseTime() == null) {
            return true;
        }
        return value.getOpenTime().isBefore(value.getCloseTime());
    }
}
