package pl.isigmas.kaucjapp.monitor.db

import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.serialization.StringDeserializer
import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.kafka.{ConsumerSettings, Subscriptions}
import org.apache.pekko.kafka.scaladsl.Consumer
import org.apache.pekko.stream.scaladsl.Sink
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, PropertyNamingStrategies}
import org.apache.pekko.stream.{ActorAttributes, Supervision}
import pl.isigmas.kaucjapp.common.logger.{LogLevel, SystemLog}
import pl.isigmas.kaucjapp.monitor.db.LogRepository

import scala.concurrent.duration.*
import com.typesafe.config.Config

object DatabaseLogSaver {
  def start(implicit system: ActorSystem[?]): Unit = {
    import system.executionContext
    val config = system.settings.config
    // Producers (see SnakeCaseKafkaJsonSerializer in common) publish snake_case JSON.
    val mapper = new ObjectMapper()
      .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
      .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
      .findAndRegisterModules()

    val dbConsumerSettings = ConsumerSettings(system, new StringDeserializer, new StringDeserializer)
      .withBootstrapServers(config.getString("app.kafka.bootstrap-servers"))
      .withGroupId(config.getString("app.kafka.group-id"))
      .withProperty(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest")
      .withPropertyIfExists(config, "security.protocol", "app.kafka.security-protocol")
      .withPropertyIfExists(config, "sasl.mechanism", "app.kafka.sasl-mechanism")
      .withPropertyIfExists(config, "sasl.jaas.config", "app.kafka.sasl-jaas-config")

    val kafkaTopic = config.getString("app.kafka.topic")

    Consumer
      .plainSource(dbConsumerSettings, Subscriptions.topics(kafkaTopic))
      .map(record => mapper.readValue(record.value(), classOf[SystemLog]))
      // a malformed message must be skipped, not terminate the whole log pipeline
      .withAttributes(ActorAttributes.supervisionStrategy(Supervision.resumingDecider))

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

extension [K, V](settings: ConsumerSettings[K, V])
  private def withPropertyIfExists(config: Config, key: String, path: String): ConsumerSettings[K, V] =
    if (config.hasPath(path)) settings.withProperty(key, config.getString(path)) else settings
