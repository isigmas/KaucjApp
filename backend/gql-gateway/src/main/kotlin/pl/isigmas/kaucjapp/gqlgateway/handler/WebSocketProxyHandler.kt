package pl.isigmas.kaucjapp.gqlgateway.handler

import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.util.AntPathMatcher
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.WebSocketHttpHeaders
import org.springframework.web.socket.WebSocketMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.client.WebSocketClient
import org.springframework.web.socket.client.standard.StandardWebSocketClient
import pl.isigmas.kaucjapp.gqlgateway.config.GatewayProperties
import java.net.URI
import java.util.concurrent.ConcurrentHashMap

class WebSocketProxyHandler(
    private val gatewayProperties: GatewayProperties,
    private val webSocketClient: WebSocketClient = StandardWebSocketClient()
) : WebSocketHandler {

    private val log = LoggerFactory.getLogger(WebSocketProxyHandler::class.java)
    private val pathMatcher = AntPathMatcher()

    private val downstreamSessions = ConcurrentHashMap<String, WebSocketSession>()
    private val clientSessions = ConcurrentHashMap<String, WebSocketSession>()

    override fun afterConnectionEstablished(clientSession: WebSocketSession) {
        val requestPath = clientSession.uri?.path ?: "/"
        val queryString = clientSession.uri?.query

        val matchedRoute = findMatchingRoute(requestPath)
        if (matchedRoute == null) {
            log.warn("No route found for WS request: {}", requestPath)
            clientSession.close(CloseStatus.NOT_ACCEPTABLE.withReason("Route not found"))
            return
        }

        val targetUrl = buildWsUrl(matchedRoute, requestPath, queryString)
        log.info("Proxying WebSocket from {} to {}", requestPath, targetUrl)

        val headers = HttpHeaders()
        @Suppress("UNCHECKED_CAST")
        val captured = clientSession.attributes[HeadersCapturingHandshakeInterceptor.CAPTURED_HEADERS_ATTR] as? Map<String, List<String>>
        if (captured != null) {
            for ((key, values) in captured) {
                val lower = key.lowercase()
                if (lower !in WEB_SOCKET_HEADERS_TO_SKIP) {
                    headers.addAll(key, values)
                }
            }
        }

        webSocketClient.execute(object : WebSocketHandler {
            override fun afterConnectionEstablished(downstreamSession: WebSocketSession) {
                downstreamSessions[clientSession.id] = downstreamSession
                clientSessions[downstreamSession.id] = clientSession
                log.debug("Downstream WS connected: {}", targetUrl)
            }

            override fun handleMessage(downstreamSession: WebSocketSession, message: WebSocketMessage<*>) {
                val cSession = clientSessions[downstreamSession.id]
                if (cSession != null && cSession.isOpen) {
                    cSession.sendMessage(message)
                }
            }

            override fun handleTransportError(downstreamSession: WebSocketSession, exception: Throwable) {
                log.error("Downstream WS transport error for {}", targetUrl, exception)
            }

            override fun afterConnectionClosed(downstreamSession: WebSocketSession, closeStatus: CloseStatus) {
                clientSessions.remove(downstreamSession.id)
                val cSession = downstreamSessions.remove(clientSession.id)
                if (cSession != null && cSession.isOpen) {
                    try {
                        cSession.close(closeStatus)
                    } catch (e: Exception) {
                        // ignored
                    }
                }
            }

            override fun supportsPartialMessages(): Boolean = false
        }, WebSocketHttpHeaders(headers), URI.create(targetUrl)).whenComplete { _, ex ->
            if (ex != null) {
                log.error("Failed to connect to downstream WS: {}", targetUrl, ex)
                try {
                    clientSession.close(CloseStatus.SERVER_ERROR.withReason("Downstream connection failed"))
                } catch (ignored: Exception) {
                    // ignored
                }
            }
        }
    }

    override fun handleMessage(clientSession: WebSocketSession, message: WebSocketMessage<*>) {
        val downstreamSession = downstreamSessions[clientSession.id]
        if (downstreamSession != null && downstreamSession.isOpen) {
            downstreamSession.sendMessage(message)
        }
    }

    override fun handleTransportError(clientSession: WebSocketSession, exception: Throwable) {
        log.error("Client WS transport error", exception)
    }

    override fun afterConnectionClosed(clientSession: WebSocketSession, closeStatus: CloseStatus) {
        val downstreamSession = downstreamSessions.remove(clientSession.id)
        if (downstreamSession != null) {
            clientSessions.remove(downstreamSession.id)
            if (downstreamSession.isOpen) {
                try {
                    downstreamSession.close(closeStatus)
                } catch (e: Exception) {
                    // ignored
                }
            }
        }
    }

    override fun supportsPartialMessages(): Boolean = false

    private fun findMatchingRoute(requestPath: String): GatewayProperties.Route? {
        for (route in gatewayProperties.routes) {
            val pattern = route.path ?: continue
            if (pathMatcher.match(pattern, requestPath)) {
                return route
            }
        }
        return null
    }

    private fun buildWsUrl(route: GatewayProperties.Route, requestPath: String, queryString: String?): String {
        var uri = route.uri ?: return requestPath
        uri = uri.replace("http://", "ws://").replace("https://", "wss://")
        val base = uri.trimEnd('/')
        val fullPath = if (queryString != null) "$requestPath?$queryString" else requestPath
        return "$base$fullPath"
    }

    companion object {
        private val WEB_SOCKET_HEADERS_TO_SKIP = setOf(
            "sec-websocket-key", "sec-websocket-version", "sec-websocket-extensions",
            "upgrade", "connection", "host"
        )
    }
}
