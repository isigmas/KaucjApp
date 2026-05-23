package pl.isigmas.kaucjapp.monitor.worker

import org.apache.pekko.actor.typed.Behavior
import org.apache.pekko.actor.typed.scaladsl.Behaviors

enum KafkaWorkerCommand:
  case StartChecking

object KafkaMonitorWorker:
  def apply(): Behavior[KafkaWorkerCommand] = Behaviors.setup { context =>
    context.log.info("KafkaMonitorWorker ready")

    Behaviors.receiveMessage {
      case KafkaWorkerCommand.StartChecking =>
        context.log.info("KafkaWorker: Checking kafka connection...")
        Behaviors.same
    }
  }