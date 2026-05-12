package pl.isigmas.kaucjapp.monitor

import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.actor.typed.Behavior
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import pl.isigmas.kaucjapp.monitor.worker.{KafkaMonitorWorker, KafkaWorkerCommand}

enum MonitorCommand:
  case CheckAllServices
  case ServiceUp(name: String)

object MonitorGuardian:
  def apply(): Behavior[MonitorCommand] = Behaviors.setup { context =>

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

@main def startPekkoMonitor(): Unit =
  val system: ActorSystem[MonitorCommand] = ActorSystem(MonitorGuardian(), "MonitorSystem")

  system ! MonitorCommand.CheckAllServices