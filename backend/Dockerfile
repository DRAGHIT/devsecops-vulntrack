# ==============================================================================
# VulnTrack Backend Multi-Stage Dockerfile
# Base Image: Eclipse Temurin Java 17 (Alpine)
# Security: Non-Root Execution (UID 10001), Minimal Attack Surface
# ==============================================================================

# Stage 1: Build & Package
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper and POM first for efficient layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy application source code and compile production JAR
COPY src/ ./src/
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Hardened Production Runtime
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Security: Create non-root system group and user
RUN addgroup --system --gid 10001 appgroup && \
    adduser --system --uid 10001 --ingroup appgroup --no-create-home appuser

# Copy executable jar from builder stage
COPY --from=builder /build/target/vulntrack-backend-1.0.0.jar /app/app.jar

# Enforce file ownership for non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER 10001

# Expose backend API port
EXPOSE 8080

# Environment variables with sensible defaults
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

# Healthcheck for standalone container environments
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
