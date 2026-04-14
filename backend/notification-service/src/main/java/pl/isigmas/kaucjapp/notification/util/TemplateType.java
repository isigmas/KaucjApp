package pl.isigmas.kaucjapp.notification.util;

import lombok.Getter;

@Getter
public enum TemplateType {
    WELCOME("welcome-email");

    private final String templateName;

    TemplateType(String templateName) {
        this.templateName = templateName;
    }

}
