FROM eclipse-temurin:25-jdk AS builder

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

COPY offers-service offers-service
COPY users-service users-service

RUN chmod +x ./mvnw

ARG SERVICE_NAME

RUN ./mvnw clean package -pl ${SERVICE_NAME} -am -Dmaven.test.skip=true
FROM eclipse-temurin:25-jre
WORKDIR /app

ARG SERVICE_NAME

COPY --from=builder /app/${SERVICE_NAME}/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]