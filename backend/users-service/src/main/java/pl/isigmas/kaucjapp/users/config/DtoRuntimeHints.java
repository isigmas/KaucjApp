package pl.isigmas.kaucjapp.users.config;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.RegexPatternTypeFilter;

import pl.isigmas.kaucjapp.common.logger.LogLevel;
import pl.isigmas.kaucjapp.common.logger.SystemLog;
import pl.isigmas.kaucjapp.users.DTO.CreateUserDTO;
import pl.isigmas.kaucjapp.users.DTO.OfferCompletedEventDTO;

import java.util.UUID;
import java.util.regex.Pattern;

public class DtoRuntimeHints implements RuntimeHintsRegistrar {

    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        hints.reflection().registerType(
                SystemLog.class,
                MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                MemberCategory.INVOKE_PUBLIC_METHODS
        );
        hints.reflection().registerType(LogLevel.class, MemberCategory.DECLARED_FIELDS);

        // Hibernate's multi-id loader reflectively instantiates UUID[] for
        // entities with a UUID identifier (native reachability gap).
        hints.reflection().registerType(UUID[].class);

        // Kafka instantiates the custom serializer via its no-arg constructor
        // using reflection (Utils.newInstance), so register it for native.
        hints.reflection().registerType(
                CustomKafkaJsonSerializer.class,
                MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                MemberCategory.INVOKE_DECLARED_METHODS
        );

        for (Class<?> kafkaDto : new Class<?>[]{OfferCompletedEventDTO.class, CreateUserDTO.class}) {
            hints.reflection().registerType(
                    kafkaDto,
                    MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                    MemberCategory.INVOKE_PUBLIC_METHODS,
                    MemberCategory.INVOKE_DECLARED_METHODS,
                    MemberCategory.DECLARED_FIELDS
            );
        }

        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false);

        // find all classes within dto packages
        scanner.addIncludeFilter(new RegexPatternTypeFilter(Pattern.compile("(?i).*\\.dto\\..*")));

        scanner.findCandidateComponents("pl.isigmas.kaucjapp").forEach(beanDefinition -> {
            try {
                hints.reflection().registerType(
                        Class.forName(beanDefinition.getBeanClassName(), false, classLoader),
                        MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                        MemberCategory.INVOKE_PUBLIC_METHODS,
                        MemberCategory.INVOKE_DECLARED_METHODS,
                        MemberCategory.DECLARED_FIELDS
                );
            } catch (Exception _) {
                // we ignore errors for classes that are not in this module
            }
        });
    }
}
