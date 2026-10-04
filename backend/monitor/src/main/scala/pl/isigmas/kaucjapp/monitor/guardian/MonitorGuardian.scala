package pl.isigmas.kaucjapp.monitor.guardian

import org.apache.pekko.actor.typed.Behavior
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import pl.isigmas.kaucjapp.monitor.db.DatabaseLogSaver
import pl.isigmas.kaucjapp.monitor.server.MonitoringServer
import pl.isigmas.kaucjapp.monitor.worker.{KafkaMonitorWorker, KafkaWorkerCommand}

enum MonitorCommand:
  case CheckAllServices
  case ServiceUp(name: String)

object MonitorGuardian:
  def apply(): Behavior[MonitorCommand] = Behaviors.setup { context =>

    MonitoringServer.start(using context.system)

    DatabaseLogSaver.start(using context.system)

    val kafkaWorker = context.spawn(KafkaMonitorWorker(), "kafka-worker")

    Behaviors.receiveMessage {
      case MonitorCommand.CheckAllServices =>
        context.log.info("Checking all services...")
        kafkaWorker ! KafkaWorkerCommand.StartChecking
        Behaviors.same
      case MonitorCommand.ServiceUp(name) =>
        context.log.info(s"Received confirmation: $name working")
        Behaviors.same
    }
  }