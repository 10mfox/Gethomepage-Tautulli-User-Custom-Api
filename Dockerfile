# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy all project files
COPY . .

# Build React app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and lock file
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy necessary files from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/server.js ./
COPY --from=build /app/logger.js ./
COPY --from=build /app/settings.js ./
COPY --from=build /app/config.js ./

# Create config directory with proper permissions
RUN mkdir -p config && chown -R node:node config

# Create volume for persistent config
VOLUME /app/config

# Use non-root user
USER node

# Expose the port the app runs on
EXPOSE 3009

# Command to run the application
CMD ["node", "server.js"]