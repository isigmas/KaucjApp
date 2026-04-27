package pl.isigmas.kaucjapp.notification.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/api/notification/account/confirm")
    public String showConfirmationPage() {
        return "account-registration-confirmation";
    }

    @GetMapping("/api/notification/account/resetpassword")
    public String showResetPasswordPage() {
        return "reset-password-page";
    }
}