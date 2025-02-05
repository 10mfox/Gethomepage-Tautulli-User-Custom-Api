FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Create config directory and set permissions
RUN mkdir -p config && chown -R node:node config

# Build the React application
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Switch to non-root user
USER node

# Expose port
EXPOSE 3009

# Ensure server.js is in the correct location
RUN ls -la server.js

# Start the application
CMD ["node", "./server.js"]