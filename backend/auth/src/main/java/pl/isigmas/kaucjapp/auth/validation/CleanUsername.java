package pl.isigmas.kaucjapp.auth.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ProfanityValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface CleanUsername {
    String message() default "Username contains inappropriate words";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}