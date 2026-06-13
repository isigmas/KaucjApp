package pl.isigmas.kaucjapp.deposit.config;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.RegexPatternTypeFilter;
import pl.isigmas.kaucjapp.common.logger.LogLevel;
import pl.isigmas.kaucjapp.common.logger.SystemLog;
import pl.isigmas.kaucjapp.deposit.validation.ConsistentOpeningHourValidator;
import pl.isigmas.kaucjapp.deposit.validation.UniqueDaysOfWeekValidator;

import java.util.UUID;
import java.util.regex.Pattern;

public class NativeRuntimeHints implements RuntimeHintsRegistrar {

    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        // SystemLog / LogLevel: also @RegisterReflectionForBinding on types in common (Jackson + native).
        hints.reflection().registerType(
                SystemLog.class,
                MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                MemberCategory.INVOKE_PUBLIC_METHODS,
                MemberCategory.INVOKE_DECLARED_METHODS,
                MemberCategory.DECLARED_FIELDS
        );
        hints.reflection().registerType(
                LogLevel.class,
                MemberCategory.INVOKE_PUBLIC_METHODS,
                MemberCategory.DECLARED_FIELDS
        );

        // Kafka instantiates the custom serializer via its no-arg constructor
        // using reflection (Utils.newInstance), so register it for native.
        hints.reflection().registerType(
                CustomKafkaJsonSerializer.class,
                MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                MemberCategory.INVOKE_DECLARED_METHODS
        );

        // Hibernate's multi-id loader reflectively instantiates UUID[] for
        // entities with a UUID identifier (native reachability gap).
        hints.reflection().registerType(UUID[].class);

        hints.resources().registerPattern("db/migration/*");

        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new RegexPatternTypeFilter(Pattern.compile("(?i).*\\.dto\\..*")));
        scanner.findCandidateComponents("pl.isigmas.kaucjapp.deposit").forEach(beanDefinition -> {
            try {
                hints.reflection().registerType(
                        Class.forName(beanDefinition.getBeanClassName(), false, classLoader),
                        MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                        MemberCategory.INVOKE_PUBLIC_METHODS,
                        MemberCategory.INVOKE_DECLARED_METHODS,
                        MemberCategory.DECLARED_FIELDS
                );
            } catch (Exception ignored) {
                // ignore classes not on this module's classpath
            }
        });

        // Jakarta Bean Validation instantiates constraint validators via reflection.
        for (Class<?> validator : new Class<?>[]{
                UniqueDaysOfWeekValidator.class,
                ConsistentOpeningHourValidator.class
        }) {
            hints.reflection().registerType(
                    validator,
                    MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                    MemberCategory.INVOKE_PUBLIC_METHODS
            );
        }
    }
}
