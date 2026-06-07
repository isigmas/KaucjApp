# BUILD
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app

COPY . .

COPY users-service users-service

RUN ./mvnw install -Dmaven.test.skip=true -pl users-service -am

# RUN
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

ENV SERVER_PORT=8080

COPY --from=builder /app/users-service/target/*.jar app.jar

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]