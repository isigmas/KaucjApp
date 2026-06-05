package pl.isigmas.kaucjapp.offers.config;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import pl.isigmas.kaucjapp.common.logger.LogLevel;
import pl.isigmas.kaucjapp.common.logger.SystemLog;

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

        // Jackson serializes SystemLog records when publishing to system-logs.
        hints.reflection().registerType(
                SystemLog.class,
                MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                MemberCategory.INVOKE_PUBLIC_METHODS
        );
        hints.reflection().registerType(LogLevel.class, MemberCategory.DECLARED_FIELDS);

        // Hibernate's multi-id loader reflectively instantiates UUID[] for
        // entities with a UUID identifier (native reachability gap).
        hints.reflection().registerType(UUID[].class);

        hints.resources().registerPattern("poland.geo.json");

        // jts2geojson / wololo.geojson instantiate geometry types via reflection from JSON "type".
        for (String typeName : new String[]{
                "org.wololo.geojson.Polygon",
                "org.wololo.geojson.MultiPolygon",
                "org.wololo.geojson.GeometryCollection",
                "org.wololo.geojson.Feature",
                "org.wololo.geojson.FeatureCollection"
        }) {
            try {
                Class<?> type = Class.forName(typeName, false, classLoader);
                hints.reflection().registerType(
                        type,
                        MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                        MemberCategory.INVOKE_PUBLIC_METHODS,
                        MemberCategory.DECLARED_FIELDS
                );
            } catch (ClassNotFoundException ignored) {
                // optional types not on classpath
            }
        }
    }
}
