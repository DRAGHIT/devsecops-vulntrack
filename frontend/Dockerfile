# ==============================================================================
# VulnTrack Frontend Multi-Stage Dockerfile
# Stage 1: Node 20 Builder
# Stage 2: Unprivileged NGINX (non-root, UID 101, listens on 8080)
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
# nginx-unprivileged is the official flavour that runs as UID 101 and binds a
# high port, so the container never needs root.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets over the stock docroot. No cleanup RUN here: this base
# image is already UID 101, so it cannot delete the root-owned files it ships.
COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html/

# Non-root web server user provided by the base image
USER 101

# Unprivileged listen port (remapped to http://localhost:3000 by Compose)
EXPOSE 8080

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
