# Use an official Bun image as a parent image
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock/bun.lock)
# to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the React application
# This will create the production-ready static files in the 'dist' folder
RUN bun run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built React app from the builder stage
COPY --from=builder /app/export/web /usr/share/nginx/html # Updated path to export/web

# Copy custom Nginx configuration (optional, but good practice for SPAs)
# If you have a custom nginx.conf for history mode or other settings,
# place it in the same directory as your Dockerfile and uncomment the line below.
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# Tag the image with localhost/ for Podman compatibility
LABEL org.opencontainers.image.source=localhost/solfin_frontend