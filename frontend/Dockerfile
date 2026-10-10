# ==============================================================================
# VulnTrack Frontend Multi-Stage Dockerfile
# Stage 1: Node 20 Builder
# Stage 2: Hardened Alpine NGINX Server
# ==============================================================================

# Stage 1: Build Single Page Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors first to maximize layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build production bundle
COPY . .
RUN npm run build

# Stage 2: Production NGINX Host
FROM nginx:alpine AS runner

# Remove default static landing page
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
