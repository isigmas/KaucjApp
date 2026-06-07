package pl.isigmas.kaucjapp.common.logger;

import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;

@RegisterReflectionForBinding
public enum LogLevel {
    INFO, IMPORTANT, WARN, ERROR
}
