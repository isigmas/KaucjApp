package pl.isigmas.kaucjapp.users.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Health", description = "Service liveness for users-service.")
public class BaseController {

    @GetMapping("/status")
    @Operation(
            summary = "Readiness probe",
            description = "Returns a static message when the application is up. No auth headers required.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Service is reachable.")
    })
    public String hello() {
        return "Ready!";
    }
}