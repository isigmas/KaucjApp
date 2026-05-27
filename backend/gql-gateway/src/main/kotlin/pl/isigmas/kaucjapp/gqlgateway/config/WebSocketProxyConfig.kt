package pl.isigmas.kaucjapp.gqlgateway.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry
import pl.isigmas.kaucjapp.gqlgateway.handler.HeadersCapturingHandshakeInterceptor
import pl.isigmas.kaucjapp.gqlgateway.handler.WebSocketProxyHandler

@Configuration
@EnableWebSocket
open class WebSocketProxyConfig(
    private val gatewayProperties: GatewayProperties
) : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        val handler = WebSocketProxyHandler(gatewayProperties)
        registry.addHandler(handler, "/api/**")
            .addInterceptors(HeadersCapturingHandshakeInterceptor())
            .setAllowedOrigins("*")
    }
}
