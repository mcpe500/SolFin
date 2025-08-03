# Use an official Bun image as a parent image
FROM oven/bun:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and bun.lock for dependency installation
COPY package.json bun.lock* ./

# Install dependencies using Bun
RUN bun install --frozen-lockfile --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the app
CMD ["bun", "start"]