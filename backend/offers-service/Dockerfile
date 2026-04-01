FROM eclipse-temurin:25-jdk AS builder

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x ./mvnw

COPY services/pom.xml services/
RUN ./mvnw dependency:go-offline -f services/pom.xml

COPY services/src services/src
RUN ./mvnw clean package -f services/pom.xml -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app

COPY --from=builder /app/services/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
