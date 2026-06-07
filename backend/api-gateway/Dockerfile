# BUILD
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app

COPY . .

COPY api-gateway api-gateway

RUN ./mvnw install -Dmaven.test.skip=true -pl api-gateway -am

# RUN
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

COPY --from=builder /app/api-gateway/target/*.jar app.jar

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]