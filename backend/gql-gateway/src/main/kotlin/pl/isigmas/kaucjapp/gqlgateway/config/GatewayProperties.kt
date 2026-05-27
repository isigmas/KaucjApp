package pl.isigmas.kaucjapp.gqlgateway.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "gateway")
open class GatewayProperties {
    var routes: List<Route> = ArrayList()

    class Route {
        var id: String? = null
        var path: String? = null
        var uri: String? = null
    }
}
