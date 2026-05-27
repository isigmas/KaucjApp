package pl.isigmas.kaucjapp.gqlgateway.controller

import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.time.Instant

@Controller
open class StatusGraphQLController {

    @QueryMapping
    fun status(): Map<String, String> {
        return mapOf(
            "service" to "gql-gateway",
            "version" to "0.0.1-SNAPSHOT",
            "uptime" to Instant.now().toString()
        )
    }

    @QueryMapping
    fun hello(): String = "Hello from GraphQL Gateway"
}
