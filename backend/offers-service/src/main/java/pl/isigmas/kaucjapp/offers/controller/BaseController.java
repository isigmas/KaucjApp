package pl.isigmas.kaucjapp.offers.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(
        name = "Health",
        description = "Liveness/readiness for offers-service (no business auth on /api/status).")
public class BaseController {

    @GetMapping("/status")
    @Operation(
            summary = "Readiness probe",
            description = "Returns plain text when the JVM and web stack are up. No headers required; use from orchestrator or load balancer.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Body: \"Ready!\".")
    })
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Ready!");
    }
}
