package pl.isigmas.kaucjapp.repository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/offers")
public class OfferRepo {

    @GetMapping("/create")
    public String create() {
        return "Ready!";
    }

    @GetMapping("/update")
    public String update() {
        return "update";
    }

    @GetMapping("/remove")
    public String remove() {
        return "remove";
    }
}
