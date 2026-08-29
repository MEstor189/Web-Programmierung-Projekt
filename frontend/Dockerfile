# ===================================================================
# Stage 1: Build SPA Bundle (Node.js 20 LTS Alpine)
# ===================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency descriptors for optimal layer caching
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# ===================================================================
# Stage 2: Minimal High-Performance Web Server (Nginx Alpine)
# ===================================================================
FROM nginx:alpine AS runtime

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled SPA bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing and API reverse-proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP Port
EXPOSE 80

# Healthcheck for container orchestrator
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
