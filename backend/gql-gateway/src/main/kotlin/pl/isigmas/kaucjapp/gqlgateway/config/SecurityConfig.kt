package pl.isigmas.kaucjapp.gqlgateway.config

import jakarta.servlet.DispatcherType
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.web.SecurityFilterChain
import javax.crypto.spec.SecretKeySpec

@Configuration
@EnableWebSecurity
open class SecurityConfig(
    @Value("\${jwt.secret}") private val jwtSecret: String
) {

    @Bean
    @Order(1)
    open fun publicSecurityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .securityMatcher { request ->
                val path = request.requestURI
                path != null && (
                    (path.startsWith("/api/auth/") && !path.contains("/admin/")) ||
                        path.startsWith("/api/notification/account/")
                    )
            }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { it.anyRequest().permitAll() }
        return http.build()
    }

    @Bean
    @Order(2)
    open fun protectedSecurityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { authorize ->
                authorize
                    .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                    .requestMatchers("/api/*/admin/**", "/api/*/*/admin/**").hasRole("ADMIN")
                    .requestMatchers("/graphql").permitAll()
                    .requestMatchers("/api/auth/status").permitAll()
                    .requestMatchers("/status").permitAll()
                    .anyRequest().authenticated()
            }
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.decoder(jwtDecoder())
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())
                }
            }
        return http.build()
    }

    @Bean
    open fun jwtDecoder(): JwtDecoder {
        val keyBytes = jwtSecret.toByteArray()
        val key = SecretKeySpec(keyBytes, "HmacSHA256")
        return NimbusJwtDecoder.withSecretKey(key).build()
    }

    private fun jwtAuthenticationConverter(): JwtAuthenticationConverter {
        val converter = JwtAuthenticationConverter()
        converter.setJwtGrantedAuthoritiesConverter { jwt ->
            val role = jwt.getClaimAsString("role")
            if (role.isNullOrBlank()) {
                emptyList()
            } else {
                listOf(SimpleGrantedAuthority("ROLE_$role"))
            }
        }
        return converter
    }
}
