package pl.isigmas.kaucjapp.notification.util;

import lombok.Getter;

@Getter
public enum TemplateType {
    WELCOME("welcome-email"),
    RESET_PASSWORD("reset-password-email");

    private final String templateName;

    TemplateType(String templateName) {
        this.templateName = templateName;
    }

}
