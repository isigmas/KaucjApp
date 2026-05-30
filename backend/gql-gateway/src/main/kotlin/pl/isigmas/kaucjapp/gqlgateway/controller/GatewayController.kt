package pl.isigmas.kaucjapp.gqlgateway.controller

import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import pl.isigmas.kaucjapp.gqlgateway.service.GatewayService

@RestController
class GatewayController(
    private val gatewayService: GatewayService
) {

    companion object {
        private val log = LoggerFactory.getLogger(GatewayController::class.java)
    }

    @GetMapping("/api/gateway/status", "/status")
    fun status(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(
            mapOf(
                "service" to "gql-gateway",
                "status" to "UP",
                "version" to "0.0.1-SNAPSHOT"
            )
        )
    }

    @PostMapping("/api/gateway/admin/ticket")
    fun createTicket(): ResponseEntity<String> {

        val ticket = gatewayService.createAdminTicket()
        log.info("Admin access ticket created")

        return ResponseEntity.ok(ticket)
    }
}
