# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or bun.lock)
# to install dependencies
COPY package.json bun.lock* ./

# Install app dependencies
RUN npm install --frozen-lockfile --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3002

# Define the command to run the app
CMD ["npm", "start"]

# Tag the image with localhost/ for Podman compatibility
LABEL org.opencontainers.image.source=localhost/solfin_solfin_database