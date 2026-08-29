# ===================================================================
# Stage 1: Build & Package (JDK 21 Builder Container)
# ===================================================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# Copy Maven wrapper & project descriptor for layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw

# Copy source code and build production artifact
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# ===================================================================
# Stage 2: Minimal Production Runtime (JRE 21 Alpine)
# ===================================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Create unprivileged system group and user for defense-in-depth security
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Prepare persistent storage directories for uploads and file-based H2 database
RUN mkdir -p /app/uploads/documents /app/data && \
    chown -R spring:spring /app

# Copy compiled JAR from builder stage
COPY --from=builder /build/target/*.jar /app/app.jar
RUN chown spring:spring /app/app.jar

# Switch to unprivileged user
USER spring:spring

# Expose REST-API & Swagger UI Port
EXPOSE 8000

# Environment Defaults
ENV SERVER_PORT=8000 \
    ATS_UPLOAD_DIR=/app/uploads/documents \
    SPRING_DATASOURCE_URL=jdbc:h2:file:/app/data/dev;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE

# Container Healthcheck probe via Spring Boot Actuator (ADR 0020)
HEALTHCHECK --interval=20s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -q --spider http://localhost:8000/actuator/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
