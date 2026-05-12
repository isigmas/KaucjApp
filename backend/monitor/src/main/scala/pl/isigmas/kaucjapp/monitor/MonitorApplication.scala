package pl.isigmas.kaucjapp.monitor

import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.actor.typed.Behavior
import org.apache.pekko.actor.typed.scaladsl.Behaviors

enum MonitorCommand:
  case CheckAllServices
  case ServiceUp(name: String)

object MonitorGuardian:
  def apply(): Behavior[MonitorCommand] = Behaviors.setup { context =>
    context.log.info("System monitorowania Pekko wystartował!")

    // Tu moglibyśmy stworzyć aktorów-pracowników (workers)
    // val checker = context.spawn(ServiceChecker(), "checker")

    Behaviors.receiveMessage {
      case MonitorCommand.CheckAllServices =>
        context.log.info("Rozpoczynam sprawdzanie wszystkich usług...")
        Behaviors.same
      case MonitorCommand.ServiceUp(name) =>
        context.log.info(s"Otrzymano potwierdzenie: $name działa!")
        Behaviors.same
    }
  }

@main def startPekkoMonitor(): Unit =
  val system: ActorSystem[MonitorCommand] = ActorSystem(MonitorGuardian(), "MonitorSystem")

  system ! MonitorCommand.CheckAllServices