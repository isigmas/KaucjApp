package pl.isigmas.kaucjapp.controller;

import pl.isigmas.kaucjapp.DTO.OfferDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api")
public class OfferController {

    @PutMapping("/offer")
    public String create(@RequestBody OfferDTO newOffer) {
        return "create";
    }

    @PutMapping("/offer/{id}")
    public String update(@RequestBody OfferDTO updatedOffer, @PathVariable Long id) {
        return "update";
    }
}
