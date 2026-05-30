package pl.isigmas.kaucjapp.offers.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.offers.DTO.ComplaintResponseDTO;
import pl.isigmas.kaucjapp.offers.service.OfferService;

import java.util.List;

@RestController
@RequestMapping("/api/offer/admin")
@RequiredArgsConstructor
public class OfferAdminController {

    private final OfferService service;
    private final Logger logger;


    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponseDTO>> getComplaints(){
        logger.info("Getting all complaints");
        return ResponseEntity.ok(service.getAllComplaints());
    }
}
