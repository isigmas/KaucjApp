package pl.isigmas.kaucjapp.monitor.db

import io.getquill.*
import pl.isigmas.kaucjapp.common.logger.{LogLevel, SystemLog}
import scala.concurrent.{ExecutionContext, Future}

object LogRepository {

  private val ctx = new CassandraAsyncContext(SnakeCase, "ctx")
  import ctx.*

  given MappedEncoding[LogLevel, String] = MappedEncoding[LogLevel, String](_.toString)
  given MappedEncoding[String, LogLevel] = MappedEncoding[String, LogLevel](LogLevel.valueOf)

  private case class SystemLogEntity(
                                      bucket: String,
                                      serviceName: String,
                                      level: LogLevel,
                                      message: String,
                                      timestamp: Long
                                    )

  private inline given SchemaMeta[SystemLogEntity] = schemaMeta[SystemLogEntity]("system_log")

  private val bucketName = "global"

  def saveBatch(logs: List[SystemLog])(implicit ec: ExecutionContext): Future[Unit] = {

    val entitiesForDb = logs.map(log =>
      SystemLogEntity(bucketName, log.serviceName(), log.level(), log.message(), log.timestamp())
    )

    val batchQuery = quote {
      liftQuery(entitiesForDb).foreach(entity => query[SystemLogEntity].insertValue(entity))
    }

    ctx.run(batchQuery).map(_ => ())
  }

  def findLast(amount: Int)(implicit ec: ExecutionContext): Future[List[SystemLog]] = {
    val queryResult: Future[List[SystemLogEntity]] = ctx.run(
      query[SystemLogEntity]
        .filter(_.bucket == lift(bucketName))
        .sortBy(_.timestamp)(using Ord.desc)
        .take(lift(amount))
    )

    queryResult.map { entities =>
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
}