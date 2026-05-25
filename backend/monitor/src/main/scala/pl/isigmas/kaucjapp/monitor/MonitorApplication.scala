package pl.isigmas.kaucjapp.monitor

import org.apache.pekko.actor.typed.ActorSystem
import pl.isigmas.kaucjapp.monitor.guardian.{MonitorCommand, MonitorGuardian}

@main def startPekkoMonitor(): Unit =
  val system: ActorSystem[MonitorCommand] = ActorSystem(MonitorGuardian(), "MonitorSystem")

  system ! MonitorCommand.CheckAllServices