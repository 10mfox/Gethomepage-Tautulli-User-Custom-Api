// logger.js
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
║            TAUTULLI CUSTOM API             ║
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
  console.log(`${colors.white}▸ Environment: ${colors.yellow}${process.env.NODE_ENV || 'development'}${colors.reset}\n`);
  
  console.log(`${colors.cyan}${colors.bright}AVAILABLE ENDPOINTS${colors.reset}`);
  
  // API Endpoints
  console.log(formatEndpoint(baseUrl, '/api/users', 'List all users with sorting and filtering'));
  console.log(formatEndpoint(baseUrl, '/api/users/:userId', 'Get specific user details'));
  console.log(formatEndpoint(baseUrl, '/api/format-settings', 'Get current format settings'));
  console.log(formatEndpoint(baseUrl, '/api/format-settings', 'Update format settings (POST)\n'));
}

function logApiRequest(method, endpoint, params = {}) {
  console.log(`${colors.blue}${colors.bright}API REQUEST${colors.reset}`);
  console.log(`${colors.white}▸ Method: ${colors.yellow}${method}${colors.reset}`);
  console.log(`${colors.white}▸ Endpoint: ${colors.yellow}${endpoint}${colors.reset}`);
  if (Object.keys(params).length > 0) {
    console.log(`${colors.white}▸ Params: ${colors.dim}${JSON.stringify(params)}${colors.reset}`);
  }
  console.log();
}

function logApiResponse(status, data) {
  const color = status >= 400 ? colors.red : colors.green;
  console.log(`${colors.blue}${colors.bright}API RESPONSE${colors.reset}`);
  console.log(`${colors.white}▸ Status: ${color}${status}${colors.reset}`);
  if (data) {
    const summary = {
      result: data.response?.result,
      recordsTotal: data.response?.data?.recordsTotal,
      recordsFiltered: data.response?.data?.recordsFiltered,
      dataLength: data.response?.data?.data?.length
    };
    console.log(`${colors.white}▸ Data: ${colors.dim}${JSON.stringify(summary)}${colors.reset}`);
  }
  console.log();
}

function logError(context, error) {
  console.error(`${colors.red}${colors.bright}ERROR: ${context}${colors.reset}`);
  console.error(`${colors.dim}${error.message}${colors.reset}`);
  if (error.response?.data) {
    console.error(`${colors.dim}Response: ${JSON.stringify(error.response.data)}${colors.reset}`);
  }
  console.log();
}

module.exports = {
  logServerStart,
  logApiRequest,
  logApiResponse,
  logError,
  colors
};