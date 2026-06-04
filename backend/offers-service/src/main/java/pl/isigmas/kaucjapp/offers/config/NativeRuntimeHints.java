package pl.isigmas.kaucjapp.offers.config;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;

import java.util.UUID;

public class NativeRuntimeHints implements RuntimeHintsRegistrar {

    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
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
