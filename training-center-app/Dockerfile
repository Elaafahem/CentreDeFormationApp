
# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose port (8080 as per standard spring boot)
EXPOSE 8080

# Entrypoint
ENTRYPOINT ["java", "-jar", "app.jar"]
