package pl.isigmas.kaucjapp.gqlgateway

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class GqlGatewayApplication

fun main(args: Array<String>) {
    runApplication<GqlGatewayApplication>(*args)
}
