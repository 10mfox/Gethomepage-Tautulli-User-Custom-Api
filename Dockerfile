FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create config directory
RUN mkdir -p config && chown -R node:node config

RUN npm run build
RUN npm prune --production

USER node

EXPOSE 3008

CMD ["node", "server.js"]