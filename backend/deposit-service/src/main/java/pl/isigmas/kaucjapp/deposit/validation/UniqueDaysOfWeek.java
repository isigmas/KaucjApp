package pl.isigmas.kaucjapp.deposit.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = UniqueDaysOfWeekValidator.class)
@Target({FIELD})
@Retention(RUNTIME)
public @interface UniqueDaysOfWeek {

    String message() default "Each day of week may appear at most once in opening hours";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
