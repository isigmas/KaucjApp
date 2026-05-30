package pl.isigmas.kaucjapp.gqlgateway.repository

import org.springframework.data.repository.CrudRepository
import pl.isigmas.kaucjapp.gqlgateway.entity.UserTicket

interface UserTicketRepository : CrudRepository<UserTicket, Long> {
    fun findByTicket(ticket: String): MutableList<UserTicket>
}