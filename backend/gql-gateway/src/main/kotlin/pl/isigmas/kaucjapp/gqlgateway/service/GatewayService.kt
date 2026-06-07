package pl.isigmas.kaucjapp.gqlgateway.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pl.isigmas.kaucjapp.gqlgateway.entity.UserTicket
import pl.isigmas.kaucjapp.gqlgateway.repository.UserTicketRepository
import java.time.Instant
import java.util.UUID

@Service
class GatewayService(
    private val ticketRepository: UserTicketRepository
) {

    @Transactional
    fun createAdminTicket(userId: Long): String {
        val ticket = UUID.randomUUID().toString()

        val userTicket = UserTicket(
            userId = userId,
            ticket = ticket,
            expiration = Instant.now().plusSeconds(120)
        )
        ticketRepository.save(userTicket)

        return ticket
    }

    @Transactional
    fun validateAndConsumeAdminTicket(ticket: String): Boolean {
        val found = ticketRepository.findByTicket(ticket)
        if (found.isEmpty()) return false

        ticketRepository.deleteAll(found)
        return true
    }
}