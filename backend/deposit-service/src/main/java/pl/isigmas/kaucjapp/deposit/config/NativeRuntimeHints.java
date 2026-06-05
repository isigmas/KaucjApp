package pl.isigmas.kaucjapp.deposit.config;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import pl.isigmas.kaucjapp.common.logger.LogLevel;
import pl.isigmas.kaucjapp.common.logger.SystemLog;

import java.util.UUID;

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
    }
}
