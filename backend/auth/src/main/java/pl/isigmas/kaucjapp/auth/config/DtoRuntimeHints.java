package pl.isigmas.kaucjapp.auth.config;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.RegexPatternTypeFilter;

import java.util.regex.Pattern;

public class DtoRuntimeHints implements RuntimeHintsRegistrar {

    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
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
