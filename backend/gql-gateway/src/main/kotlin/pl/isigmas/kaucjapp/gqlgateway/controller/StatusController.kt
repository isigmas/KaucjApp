package pl.isigmas.kaucjapp.gqlgateway.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
open class StatusController {

    @GetMapping("/status")
    fun status(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(
            mapOf(
                "service" to "gql-gateway",
                "status" to "UP",
                "version" to "0.0.1-SNAPSHOT"
            )
        )
    }
}
