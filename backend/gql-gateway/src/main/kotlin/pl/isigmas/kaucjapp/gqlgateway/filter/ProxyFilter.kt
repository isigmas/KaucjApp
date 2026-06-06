package pl.isigmas.kaucjapp.gqlgateway.filter

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.http.HttpMethod
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component
import org.springframework.util.AntPathMatcher
import org.springframework.web.client.RestClient
import org.springframework.web.filter.OncePerRequestFilter
import pl.isigmas.kaucjapp.gqlgateway.config.GatewayProperties
import java.io.ByteArrayOutputStream

@Order(0)
@Component
open class ProxyFilter(
    private val gatewayProperties: GatewayProperties
) : OncePerRequestFilter(), Ordered {

    private val restClient: RestClient = RestClient.builder().build()
    private val pathMatcher = AntPathMatcher()
    private val log = LoggerFactory.getLogger(ProxyFilter::class.java)

    override fun getOrder(): Int = 0

    companion object {
        private val RESPONSE_HOP_BY_HOP = setOf(
            "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
            "te", "trailers", "transfer-encoding", "upgrade"
        )
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val requestPath = request.requestURI

        // Skip GraphQL, WebSocket upgrade, and status endpoints
        if (requestPath.startsWith("/graphql") ||
            request.getHeader("Upgrade") != null ||
            requestPath == "/api/gateway/status"
        ) {
            filterChain.doFilter(request, response)
            return
        }

        val matchedRoute = findMatchingRoute(requestPath)
        if (matchedRoute == null) {
            filterChain.doFilter(request, response)
            return
        }

        proxyRequest(request, response, matchedRoute)
    }

    private fun findMatchingRoute(requestPath: String): GatewayProperties.Route? {
        for (route in gatewayProperties.routes) {
            val pattern = route.path ?: continue
            if (pathMatcher.match(pattern, requestPath)) {
                return route
            }
        }
        return null
    }

    private fun proxyRequest(
        request: HttpServletRequest,
        response: HttpServletResponse,
        route: GatewayProperties.Route
    ) {
        val targetUrl = buildTargetUrl(route, request.requestURI ?: "/", request.queryString)
        val method = HttpMethod.valueOf(request.method)

        log.debug("Proxying {} {} -> {}", method, request.requestURI, targetUrl)

        try {
            val requestSpec = restClient.method(method).uri(targetUrl)

            // Copy filtered headers
            val headerNames = request.headerNames
            while (headerNames.hasMoreElements()) {
                val name = headerNames.nextElement()
                val lower = name.lowercase()
                if (lower !in HeaderSanitizationFilter.HOP_BY_HOP_HEADERS &&
                    lower !in HeaderSanitizationFilter.BLOCKED_HEADERS) {
                    val values = request.getHeaders(name)
                    val valueList = mutableListOf<String>()
                    while (values.hasMoreElements()) {
                        valueList.add(values.nextElement())
                    }
                    requestSpec.header(name, *valueList.toTypedArray())
                }
            }

            // Inject X-User-Id from JWT
            injectUserIdHeader(requestSpec)

            // Add body if present
            val body = readBody(request)
            if (body != null && body.isNotEmpty()) {
                requestSpec.body(body)
            }

            requestSpec.exchange { _, res ->
                // Set status
                response.status = res.statusCode.value()

                // Copy response headers
                val responseHeaders = res.headers
                responseHeaders.forEach { name: String, values: List<String> ->
                    if (name.lowercase() !in RESPONSE_HOP_BY_HOP) {
                        for (i in values.indices) {
                            response.addHeader(name, values[i])
                        }
                    }
                }

                // Write body
                val responseBody = res.body.readAllBytes()
                response.outputStream.use { it.write(responseBody) }
                null
            }
        } catch (ex: Exception) {
            log.error("Proxy error to {}: {}", targetUrl, ex.message, ex)
            if (!response.isCommitted) {
                response.sendError(
                    HttpServletResponse.SC_BAD_GATEWAY,
                    "Failed to proxy request to downstream service"
                )
            }
        }
    }

    private fun buildTargetUrl(
        route: GatewayProperties.Route,
        requestPath: String,
        queryString: String?
    ): String {
        val uri = route.uri ?: return requestPath
        val base = uri.trimEnd('/')
        val fullPath = if (queryString != null) "$requestPath?$queryString" else requestPath
        return "$base$fullPath"
    }

    private fun readBody(request: HttpServletRequest): ByteArray? {
        return try {
            val inputStream = request.inputStream
            val outputStream = ByteArrayOutputStream()
            inputStream.copyTo(outputStream)
            val bytes = outputStream.toByteArray()
            if (bytes.isEmpty()) null else bytes
        } catch (_: Exception) {
            null
        }
    }

    private fun injectUserIdHeader(requestSpec: RestClient.RequestBodySpec) {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication is JwtAuthenticationToken) {
            val jwt = authentication.token
            val userId = jwt.getClaimAsString("user_id") ?: return
            requestSpec.header("X-User-Id", userId)
        }
    }
}
