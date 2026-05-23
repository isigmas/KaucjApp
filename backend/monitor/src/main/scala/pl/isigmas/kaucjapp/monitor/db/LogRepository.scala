package pl.isigmas.kaucjapp.monitor.db

import io.getquill.*
import pl.isigmas.kaucjapp.common.logger.{LogLevel, SystemLog}
import scala.concurrent.{ExecutionContext, Future}

object LogRepository {

  private val ctx = new PostgresJdbcContext(SnakeCase, "ctx")
  import ctx.*

  given MappedEncoding[LogLevel, String] = MappedEncoding[LogLevel, String](_.toString)
  given MappedEncoding[String, LogLevel] = MappedEncoding[String, LogLevel](LogLevel.valueOf)

  private case class SystemLogEntity(
                                      serviceName: String,
                                      level: LogLevel,
                                      message: String,
                                      timestamp: Long
                                    )

  private inline given SchemaMeta[SystemLogEntity] = schemaMeta[SystemLogEntity]("system_log")

  def saveBatch(logs: List[SystemLog])(implicit ec: ExecutionContext): Future[Unit] = Future {

    val entitiesForDb = logs.map(log =>
      SystemLogEntity(log.serviceName(), log.level(), log.message(), log.timestamp())
    )

    ctx.run(
      liftQuery(entitiesForDb).foreach(entity => query[SystemLogEntity].insertValue(entity))
    )

    ()
  }

  def findLast(amount: Int)(implicit ec: ExecutionContext): Future[List[SystemLog]] = Future {
    val entities: List[SystemLogEntity] = ctx.run(query[SystemLogEntity].sortBy(_.timestamp)(using Ord.desc).take(lift(amount)))

    entities.map(entity =>
      SystemLog(
        serviceName = entity.serviceName,
        level = entity.level,
        message = entity.message,
        timestamp = entity.timestamp
      )
    )
  }
}