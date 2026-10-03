package pl.isigmas.kaucjapp.monitor.db

import com.typesafe.config.{Config, ConfigFactory}
import com.zaxxer.hikari.{HikariConfig, HikariDataSource}
import org.flywaydb.core.Flyway
import pl.isigmas.kaucjapp.common.logger.{LogLevel, SystemLog}

import java.util.concurrent.{Executors, ThreadFactory}
import javax.sql.DataSource
import scala.collection.mutable.ListBuffer
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Using

/**
 * Postgres-backed storage for system logs (replaces the former Cassandra table `monitor_db.system_log`).
 *
 * Plain JDBC is used on purpose: the workload is two trivial statements and it keeps the shaded jar small.
 * All blocking JDBC calls run on a dedicated pool so they never starve Pekko dispatchers.
 */
object LogRepository {

  private val config: Config = ConfigFactory.load().getConfig("app.db")

  private val blockingEc: ExecutionContext = ExecutionContext.fromExecutor(
    Executors.newFixedThreadPool(
      config.getInt("pool-size"),
      new ThreadFactory {
        override def newThread(r: Runnable): Thread = {
          val t = new Thread(r, "monitor-jdbc")
          t.setDaemon(true)
          t
        }
      }
    )
  )

  private lazy val dataSource: HikariDataSource = {
    val hikari = new HikariConfig()
    hikari.setJdbcUrl(config.getString("url"))
    hikari.setUsername(config.getString("username"))
    hikari.setPassword(config.getString("password"))
    hikari.setDriverClassName("org.postgresql.Driver")
    hikari.setMaximumPoolSize(config.getInt("pool-size"))
    hikari.setMinimumIdle(1)
    hikari.setPoolName("monitor-db")
    new HikariDataSource(hikari)
  }

  /** Runs Flyway migrations. Must be called once at startup, before the repository is used. */
  def init(): Unit = {
    val flyway = Flyway
      .configure()
      .dataSource(dataSource: DataSource)
      .locations("classpath:db/migration")
      .baselineOnMigrate(true)
      .load()
    flyway.migrate()
    ()
  }

  private val insertSql =
    "INSERT INTO system_log (service_name, level, message, timestamp) VALUES (?, ?, ?, ?)"

  private val selectLastSql =
    "SELECT service_name, level, message, timestamp FROM system_log ORDER BY timestamp DESC, id DESC LIMIT ?"

  def saveBatch(logs: List[SystemLog])(implicit ec: ExecutionContext): Future[Unit] =
    Future {
      if (logs.nonEmpty) {
        Using.resource(dataSource.getConnection) { connection =>
          connection.setAutoCommit(false)
          try {
            Using.resource(connection.prepareStatement(insertSql)) { statement =>
              logs.foreach { log =>
                statement.setString(1, log.serviceName())
                statement.setString(2, log.level().toString)
                statement.setString(3, log.message())
                statement.setLong(4, log.timestamp())
                statement.addBatch()
              }
              statement.executeBatch()
            }
            connection.commit()
          } catch {
            case ex: Throwable =>
              connection.rollback()
              throw ex
          }
        }
      }
    }(blockingEc)

  def findLast(amount: Int)(implicit ec: ExecutionContext): Future[List[SystemLog]] =
    Future {
      Using.resource(dataSource.getConnection) { connection =>
        Using.resource(connection.prepareStatement(selectLastSql)) { statement =>
          statement.setInt(1, amount)
          Using.resource(statement.executeQuery()) { rs =>
            val result = ListBuffer.empty[SystemLog]
            while (rs.next()) {
              result += SystemLog(
                rs.getString("service_name"),
                LogLevel.valueOf(rs.getString("level")),
                rs.getString("message"),
                rs.getLong("timestamp")
              )
            }
            result.toList
          }
        }
      }
    }(blockingEc)
}
