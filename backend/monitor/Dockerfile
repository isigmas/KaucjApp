# BUILD
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app

COPY . .

COPY monitor monitor

RUN ./mvnw package -Dmaven.test.skip=true -pl monitor -am

# RUN
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

ENV SERVER_PORT=8080

COPY --from=builder /app/monitor/target/*-all.jar app.jar

RUN addgroup -S pekko && adduser -S pekko -G pekko
USER pekko:pekko

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]