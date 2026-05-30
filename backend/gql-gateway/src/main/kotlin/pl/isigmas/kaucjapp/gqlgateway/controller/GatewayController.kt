package pl.isigmas.kaucjapp.gqlgateway.controller

import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import pl.isigmas.kaucjapp.gqlgateway.service.GatewayService

@RequestMapping("/api/gateway")
@RestController
class GatewayController(
    private val gatewayService: GatewayService
) {

    companion object {
        private val log = LoggerFactory.getLogger(GatewayController::class.java)
    }

    @GetMapping("/status", "/status")
    fun status(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(
            mapOf(
                "service" to "gql-gateway",
                "status" to "UP",
                "version" to "0.0.1-SNAPSHOT"
            )
        )
    }

    @PostMapping("/admin/ticket")
    fun createTicket(
        @AuthenticationPrincipal jwt: Jwt
    ): ResponseEntity<String> {

        val userIdStr = jwt.getClaimAsString("user_id")
            ?: throw IllegalArgumentException("No 'user_id' claim in JWT token")
        val userId = userIdStr.toLong()

        val ticket = gatewayService.createAdminTicket(userId)
        log.info("Admin access ticket created")

        return ResponseEntity.ok(ticket)
    }
}
