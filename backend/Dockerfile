FROM gradle:8.12-jdk17 AS build
WORKDIR /app
COPY . . 
RUN chmod +x gradlew
RUN ./gradlew build -x test

FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
