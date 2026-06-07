package pl.isigmas.kaucjapp.gqlgateway.entity

import org.springframework.data.annotation.Id
import org.springframework.data.redis.core.index.Indexed
import org.springframework.data.redis.core.TimeToLive
import org.springframework.data.redis.core.RedisHash
import java.io.Serializable
import java.time.Instant
import java.util.UUID

@RedisHash("user-ticket")
class UserTicket(

    @Id val id: UUID = UUID.randomUUID(),
    val userId: Long,
    @Indexed val ticket: String,
    val createdAt: Instant = Instant.now(),
    val expiration: Instant,
    @TimeToLive val timeToLiveSeconds: Long = 600   // 10 minutes

) : Serializable