package pl.isigmas.kaucjapp.gqlgateway.handler

import org.springframework.http.HttpStatus
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.server.HandshakeInterceptor
import org.springframework.web.util.UriComponentsBuilder
import pl.isigmas.kaucjapp.gqlgateway.service.GatewayService

class TicketValidationHandshakeInterceptor(
    private val gatewayService: GatewayService
) : HandshakeInterceptor {

    override fun beforeHandshake(
        request: ServerHttpRequest,
        response: ServerHttpResponse,
        wsHandler: WebSocketHandler,
        attributes: MutableMap<String, Any>
    ) : Boolean {
        val queryParams = UriComponentsBuilder.fromUri(request.uri).build().queryParams
        val ticket = queryParams.getFirst("ticket")
        if (ticket.isNullOrBlank()) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED)
            return false
        }

        val isValid = gatewayService.validateAndConsumeAdminTicket(ticket)

        if (!isValid) {
            response.setStatusCode(HttpStatus.FORBIDDEN)
            return false
        }
        return true
    }

    override fun afterHandshake(
        request: ServerHttpRequest,
        response: ServerHttpResponse,
        wsHandler: WebSocketHandler,
        exception: Exception?
    ) {
        // Nothing to do after handshake
    }
}