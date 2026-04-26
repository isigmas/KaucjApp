package pl.isigmas.kaucjapp.notification.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/confirm")
    public String showConfirmationPage() {
        return "account-registration-confirmation";
    }
}