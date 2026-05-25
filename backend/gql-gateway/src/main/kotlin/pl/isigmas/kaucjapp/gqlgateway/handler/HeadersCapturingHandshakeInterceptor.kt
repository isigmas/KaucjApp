package pl.isigmas.kaucjapp.gqlgateway.handler

import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.server.HandshakeInterceptor
import java.util.HashMap

class HeadersCapturingHandshakeInterceptor : HandshakeInterceptor {

    companion object {
        const val CAPTURED_HEADERS_ATTR = "capturedHandshakeHeaders"
    }

    override fun beforeHandshake(
        request: ServerHttpRequest,
        response: ServerHttpResponse,
        wsHandler: WebSocketHandler,
        attributes: MutableMap<String, Any>
    ): Boolean {
        val headerMap = HashMap<String, List<String>>()
        request.headers.forEach { key: String, values: List<String> ->
            headerMap[key] = ArrayList(values)
        }
        attributes[CAPTURED_HEADERS_ATTR] = headerMap
        return true
    }

    override fun afterHandshake(
        request: ServerHttpRequest,
        response: ServerHttpResponse,
        wsHandler: WebSocketHandler,
        exception: Exception?
    ) {
        // nothing
    }
}
