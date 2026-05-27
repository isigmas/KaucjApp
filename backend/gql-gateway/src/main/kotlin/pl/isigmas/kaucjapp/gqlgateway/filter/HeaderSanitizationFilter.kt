package pl.isigmas.kaucjapp.gqlgateway.filter

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Order(-100)
@Component
open class HeaderSanitizationFilter : OncePerRequestFilter(), Ordered {

    private val log = LoggerFactory.getLogger(HeaderSanitizationFilter::class.java)

    override fun getOrder(): Int = -100

    companion object {
        val HOP_BY_HOP_HEADERS = setOf(
            "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
            "te", "trailers", "transfer-encoding", "upgrade", "host", "content-length"
        )

        val BLOCKED_HEADERS = setOf(
            "x-internal-secret"
        )
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val upgradeHeader = request.getHeader("Upgrade")
        val isWebSocketUpgrade = upgradeHeader != null && upgradeHeader.equals("websocket", ignoreCase = true)

        if (isWebSocketUpgrade) {
            filterChain.doFilter(request, response)
        } else {
            val wrapper = HeaderSanitizationRequestWrapper(request)
            filterChain.doFilter(wrapper, response)
        }
    }
}
