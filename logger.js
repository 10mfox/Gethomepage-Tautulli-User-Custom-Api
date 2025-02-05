const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
};

const banner = `
${colors.cyan}${colors.bright}╔════════════════════════════════════════════╗
║          TAUTULLI USER CUSTOM API          ║
╚════════════════════════════════════════════╝${colors.reset}
`;

function formatEndpoint(baseUrl, endpoint, description) {
  return `${colors.green}▸ ${colors.bright}${baseUrl}${endpoint}${colors.reset}\n  ${colors.dim}${description}${colors.reset}`;
}

function logServerStart(port, config) {
  const baseUrl = `http://localhost:${port}`;
  
  console.log(banner);
  console.log(`${colors.cyan}${colors.bright}SERVER INFORMATION${colors.reset}`);
  console.log(`${colors.white}▸ Status: ${colors.green}Running${colors.reset}`);
  console.log(`${colors.white}▸ Port: ${colors.yellow}${port}${colors.reset}`);
  console.log(`${colors.white}▸ Tautulli URL: ${colors.yellow}${config.baseUrl}${colors.reset}`);
  
  console.log(`${colors.cyan}${colors.bright}AVAILABLE ENDPOINTS${colors.reset}`);
  
  // API Endpoints
  console.log(formatEndpoint(baseUrl, '/api/users', 'List all users with sorting and filtering'));
}

// Silent versions of logging functions that don't output anything
function logApiRequest() {}
function logApiResponse() {}
function logError(context, error) {
  // Only log critical errors to console
  console.error(`${colors.red}${colors.bright}ERROR: ${context}${colors.reset}`);
  console.error(`${colors.dim}${error.message}${colors.reset}\n`);
}

module.exports = {
  logServerStart,
  logApiRequest,
  logApiResponse,
  logError,
  colors
};