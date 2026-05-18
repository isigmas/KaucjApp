package pl.isigmas.kaucjapp.monitor.db

import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.serialization.StringDeserializer
import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.kafka.{ConsumerSettings, Subscriptions}
import org.apache.pekko.kafka.scaladsl.Consumer
import org.apache.pekko.stream.scaladsl.Sink
import com.fasterxml.jackson.databind.ObjectMapper
import pl.isigmas.kaucjapp.common.logger.{LogLevel, SystemLog}
import pl.isigmas.kaucjapp.monitor.db.LogRepository

import scala.concurrent.duration.*

object DatabaseLogSaver {
  def start()(implicit system: ActorSystem[?]): Unit = {
    import system.executionContext
    val config = system.settings.config
    val mapper = new ObjectMapper().findAndRegisterModules()

    val dbConsumerSettings = ConsumerSettings(system, new StringDeserializer, new StringDeserializer)
      .withBootstrapServers(config.getString("app.kafka.bootstrap-servers"))
      .withGroupId("kaucjapp-db-saver-group")
      .withProperty(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest")

    val kafkaTopic = config.getString("app.kafka.topic")

    Consumer
      .plainSource(dbConsumerSettings, Subscriptions.topics(kafkaTopic))
      .map(record => mapper.readValue(record.value(), classOf[SystemLog]))

      // ignore INFO level logs
      .filter(log => log.level == LogLevel.IMPORTANT || log.level == LogLevel.WARN || log.level == LogLevel.ERROR)

      // batching 1000 logs or 1 second
      .groupedWithin(1000, 1.second)

      // db save with backpressure
      .mapAsync(parallelism = 2) { batch =>
        LogRepository.saveBatch(batch.toList)
          .map(_ => system.log.info(s"Success during saving batch ${batch.size} logs to database"))
          .recover { case ex: Throwable =>
            system.log.error(s"Error during saving batch ${batch.size} logs to database", ex)
          }
      }
      .runWith(Sink.ignore)
  }
}
