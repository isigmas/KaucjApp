package pl.isigmas.kaucjapp.users.config;

import pl.isigmas.kaucjapp.common.kafka.SnakeCaseKafkaJsonSerializer;

public class CustomKafkaJsonSerializer<T> extends SnakeCaseKafkaJsonSerializer<T> {
}
