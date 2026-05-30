package pl.isigmas.kaucjapp.gqlgateway.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry
import pl.isigmas.kaucjapp.gqlgateway.handler.HeadersCapturingHandshakeInterceptor
import pl.isigmas.kaucjapp.gqlgateway.handler.TicketValidationHandshakeInterceptor
import pl.isigmas.kaucjapp.gqlgateway.handler.WebSocketProxyHandler
import pl.isigmas.kaucjapp.gqlgateway.service.GatewayService

@Configuration
@EnableWebSocket
class WebSocketProxyConfig(
    private val gatewayProperties: GatewayProperties,
    private val gatewayService: GatewayService
) : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        val handler = WebSocketProxyHandler(gatewayProperties)
        registry.addHandler(handler,
            "/api/*/ws/**",
                     "/api/*/*/ws/**"
        )
            .addInterceptors(
                TicketValidationHandshakeInterceptor(gatewayService),
                HeadersCapturingHandshakeInterceptor())
            .setAllowedOrigins("*")
    }
}
