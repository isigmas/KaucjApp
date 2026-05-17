package pl.isigmas.kaucjapp.gqlgateway.filter

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletRequestWrapper

class HeaderSanitizationRequestWrapper(request: HttpServletRequest) : HttpServletRequestWrapper(request) {

    override fun getHeader(name: String): String? {
        val lower = name.lowercase()
        return if (lower in HeaderSanitizationFilter.HOP_BY_HOP_HEADERS ||
            lower in HeaderSanitizationFilter.BLOCKED_HEADERS) {
            null
        } else {
            super.getHeader(name)
        }
    }

    override fun getHeaders(name: String): java.util.Enumeration<String> {
        val lower = name.lowercase()
        return if (lower in HeaderSanitizationFilter.HOP_BY_HOP_HEADERS ||
            lower in HeaderSanitizationFilter.BLOCKED_HEADERS) {
            java.util.Collections.emptyEnumeration()
        } else {
            super.getHeaders(name)
        }
    }

    override fun getHeaderNames(): java.util.Enumeration<String> {
        val original = super.getHeaderNames()
        val filtered = java.util.ArrayList<String>()
        while (original.hasMoreElements()) {
            val name = original.nextElement()
            val lower = name.lowercase()
            if (lower !in HeaderSanitizationFilter.HOP_BY_HOP_HEADERS &&
                lower !in HeaderSanitizationFilter.BLOCKED_HEADERS) {
                filtered.add(name)
            }
        }
        return java.util.Collections.enumeration(filtered)
    }
}
