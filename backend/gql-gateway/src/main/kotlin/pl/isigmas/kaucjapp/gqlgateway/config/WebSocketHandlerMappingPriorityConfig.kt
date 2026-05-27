package pl.isigmas.kaucjapp.gqlgateway.config

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.config.BeanPostProcessor
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.handler.SimpleUrlHandlerMapping

@Configuration
open class WebSocketHandlerMappingPriorityConfig : BeanPostProcessor {

    private val log = LoggerFactory.getLogger(WebSocketHandlerMappingPriorityConfig::class.java)

    override fun postProcessAfterInitialization(bean: Any, beanName: String): Any {
        if (bean is SimpleUrlHandlerMapping) {
            val urlMap = bean.urlMap
            if (urlMap.isNotEmpty() && bean.order > -10) {
                val hasWebSocketHandler = urlMap.values.any {
                    it is org.springframework.web.socket.server.support.WebSocketHttpRequestHandler
                }
                if (hasWebSocketHandler) {
                    log.debug("Setting WebSocket handler mapping '{}' order to -10 (current: {})", beanName, bean.order)
                    bean.order = -10
                }
            }
        }
        return bean
    }
}
