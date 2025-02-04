# Use Node 18 alpine as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy project files
COPY . .

# Create production build of React app
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 3008

# Start the server
CMD ["node", "server.js"]