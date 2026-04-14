package pl.isigmas.kaucjapp.deposit.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = ConsistentOpeningHourValidator.class)
@Target({TYPE})
@Retention(RUNTIME)
public @interface ConsistentOpeningHour {

    String message() default "openTime must be strictly before closeTime";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
