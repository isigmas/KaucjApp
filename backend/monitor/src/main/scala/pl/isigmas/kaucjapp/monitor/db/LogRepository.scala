package pl.isigmas.kaucjapp.monitor.db

import io.getquill.*
import pl.isigmas.kaucjapp.common.logger.{LogLevel, SystemLog}
import scala.concurrent.{ExecutionContext, Future}

object LogRepository {

  private val ctx = new PostgresJdbcContext(SnakeCase, "ctx")
  import ctx.*

  given MappedEncoding[LogLevel, String] = MappedEncoding[LogLevel, String](_.toString)

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
}