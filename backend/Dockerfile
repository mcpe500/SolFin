# Use an official Bun image as a parent image
FROM oven/bun:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies using Bun
# Removed --frozen-lockfile to allow lockfile updates during build.
# It's recommended to commit an up-to-date bun.lockb locally.
RUN bun install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the app
CMD ["bun", "start"]

# Tag the image with localhost/ for Podman compatibility
LABEL org.opencontainers.image.source=localhost/solfin_backend