package pl.isigmas.kaucjapp.monitor.server

import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.serialization.StringDeserializer
import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.http.scaladsl.model.ws.{Message, TextMessage}
import org.apache.pekko.kafka.{ConsumerSettings, Subscriptions}
import org.apache.pekko.kafka.scaladsl.Consumer
import org.apache.pekko.stream.scaladsl.{BroadcastHub, Flow, Source, Sink}
import org.apache.pekko.http.scaladsl.server.Directives.*

import scala.util.{Failure, Success}

object MonitoringServer {
  def start(implicit system: ActorSystem[?]): Unit =
    import system.executionContext

    val config = system.settings.config

    val serverHost = config.getString("app.server.host")
    val serverPort = config.getInt("app.server.port")

    val kafkaServers = config.getString("app.kafka.bootstrap-servers")
    val kafkaTopic = config.getString("app.kafka.topic")
    val kafkaGroupId = config.getString("app.kafka.group-id")

    val consumerSettings = ConsumerSettings(system, new StringDeserializer, new StringDeserializer)
      .withBootstrapServers(kafkaServers)
      .withGroupId(kafkaGroupId)
      .withProperty(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest")

    val kafkaSource: Source[String, ?] = Consumer
      .plainSource(consumerSettings, Subscriptions.topics(kafkaTopic))
      .map(record => record.value())

    val sharedKafkaStream: Source[String, ?] = kafkaSource
      .runWith(BroadcastHub.sink)

    val websocketFlow: Flow[Message, Message, Any] = Flow.fromSinkAndSource(
      Sink.ignore,
      sharedKafkaStream.map(logText => TextMessage(logText))
    )

    val route = {
      pathPrefix("api" / "monitor") {
        concat(
          path("status") {
            get {
              complete("Ready")
            }
          },
          path("admin" / "ws" / "logs") {
            handleWebSocketMessages(websocketFlow)
          }
        )
      }
    }

    Http().newServerAt(serverHost, serverPort).bind(route).onComplete {
      case Success(binding) =>
        system.log.info(s"WebSocket server working at ws://$serverHost:$serverPort/api/monitor/admin/ws/logs")
      case Failure(ex) =>
        system.log.error(s"Failed to start server", ex)
    }
}
