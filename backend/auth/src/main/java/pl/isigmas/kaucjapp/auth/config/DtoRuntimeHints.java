package pl.isigmas.kaucjapp.auth.config;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.RegexPatternTypeFilter;
import pl.isigmas.kaucjapp.common.logger.LogLevel;
import pl.isigmas.kaucjapp.common.logger.SystemLog;

import java.util.regex.Pattern;

public class DtoRuntimeHints implements RuntimeHintsRegistrar {

    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        // Kafka resolves this serializer via Class.forName() from the
        // spring.kafka.producer.value-serializer property string, so it must be
        // reachable and reflectively instantiable in the native image.
        hints.reflection().registerType(
                CustomKafkaJsonSerializer.class,
                MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                MemberCategory.INVOKE_DECLARED_METHODS
        );

        // Logger publishes SystemLog to system-logs (Jackson + native).
        hints.reflection().registerType(
                SystemLog.class,
                MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                MemberCategory.INVOKE_PUBLIC_METHODS,
                MemberCategory.INVOKE_DECLARED_METHODS
        );
        hints.reflection().registerType(
                LogLevel.class,
                MemberCategory.INVOKE_PUBLIC_METHODS
        );

        // JJWT loads impl classes reflectively (Jwts.builder(), signing, Jackson serde).
        for (String typeName : new String[]{
                "io.jsonwebtoken.impl.DefaultJwtBuilder",
                "io.jsonwebtoken.impl.DefaultJwtParser",
                "io.jsonwebtoken.impl.DefaultJwtParserBuilder",
                "io.jsonwebtoken.impl.crypto.DefaultJwtSigner",
                "io.jsonwebtoken.impl.crypto.DefaultSignerFactory",
                "io.jsonwebtoken.jackson.io.JacksonSerializer",
                "io.jsonwebtoken.jackson.io.JacksonDeserializer"
        }) {
            try {
                Class<?> type = Class.forName(typeName, false, classLoader);
                hints.reflection().registerType(
                        type,
                        MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                        MemberCategory.INVOKE_PUBLIC_METHODS,
                        MemberCategory.INVOKE_DECLARED_METHODS
                );
            } catch (ClassNotFoundException ignored) {
                // optional jjwt-impl / jjwt-jackson types
            }
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
                // ignore errors for classes that are not in this module
            }
        });
    }
}
