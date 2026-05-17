package pl.isigmas.kaucjapp.monitor.handler

import pl.isigmas.kaucjapp.common.logger.{LogLevel, SystemLog}

def processIncomingLog(log: SystemLog): Unit = {
  log.level match {
    case LogLevel.IMPORTANT | LogLevel.WARN | LogLevel.ERROR =>
      ()

    case LogLevel.INFO =>
      ()
  }
}