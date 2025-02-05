const path = require('path');

// Environment variables with defaults
const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.USER_API_PORT || 3009,
  TAUTULLI_BASE_URL: process.env.TAUTULLI_BASE_URL || '',
  TAUTULLI_API_KEY: process.env.TAUTULLI_API_KEY || ''
};

// Clean up Tautulli base URL
const cleanTautulliUrl = (url) => {
  return url
    .replace(/\/+$/, '')        // Remove trailing slashes
    .replace(/\/api\/v2$/, ''); // Remove API endpoint if included
};

// Application paths
const PATHS = {
  root: path.resolve(__dirname),
  config: path.resolve(__dirname, 'config'),
  build: path.resolve(__dirname, 'build'),
  settings: path.resolve(__dirname, 'config', 'settings.json')
};

// Default settings template
const DEFAULT_SETTINGS = {
  fields: [
    {
      id: 'status_message',
      template: 'Seen [ ${last_seen_formatted} ] Watching ( ${last_played} )'
    }
  ]
};

// Server configuration
const SERVER = {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  api: {
    prefix: '/api'
  }
};

// Tautulli API configuration
const TAUTULLI = {
  baseUrl: cleanTautulliUrl(ENV.TAUTULLI_BASE_URL),
  apiKey: ENV.TAUTULLI_API_KEY,
  timeout: 10000, // API request timeout in milliseconds
  endpoints: {
    base: '/api/v2',
    users: 'get_users_table',
    user: 'get_user'
  }
};

// Export configuration
module.exports = {
  env: ENV.NODE_ENV,
  port: ENV.PORT,
  paths: PATHS,
  server: SERVER,
  tautulli: TAUTULLI,
  defaultSettings: DEFAULT_SETTINGS,
  isDev: ENV.NODE_ENV === 'development',
  isProd: ENV.NODE_ENV === 'production'
};