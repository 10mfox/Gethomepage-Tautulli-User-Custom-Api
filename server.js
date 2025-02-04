const express = require('express');
const axios = require('axios');
const path = require('path');
const logger = require('./logger');
const { loadSettings, saveSettings } = require('./config/settings');

const app = express();
const PORT = process.env.USER_API_PORT || 3009;

// Configuration
const config = {
  get baseUrl() {
    let url = process.env.TAUTULLI_BASE_URL || '';
    url = url.replace(/\/+$/, '');
    url = url.replace(/\/api\/v2$/, '');
    return url;
  },
  apiKey: process.env.TAUTULLI_API_KEY
};

// Middleware
app.use(express.json());
app.use(express.static('build'));

// Format settings endpoints
app.get('/api/format-settings', async (req, res) => {
  try {
    const settings = await loadSettings();
    logger.logApiRequest('GET', '/api/format-settings');
    res.json(settings);
  } catch (error) {
    logger.logError('Format Settings', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

app.post('/api/format-settings', async (req, res) => {
  try {
    const { fields } = req.body;
    if (!Array.isArray(fields)) {
      throw new Error('Invalid format settings');
    }
    await saveSettings({ fields });
    logger.logApiRequest('POST', '/api/format-settings', { fields });
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    logger.logError('Format Settings', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Utility Functions
function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

function formatTimeDifference(timestamp) {
  if (!timestamp) return 'Never';
  
  const now = Date.now() / 1000;
  const diffInSeconds = Math.floor(now - timestamp);
  
  if (diffInSeconds < 60) {
    return 'Just Now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes !== 1 ? 'Minutes' : 'Minute'} Ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours !== 1 ? 'Hours' : 'Hour'} Ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days !== 1 ? 'Days' : 'Day'} Ago`;
  }
}

async function transformUserData(responseData) {
  try {
    if (!responseData?.response?.data?.data) {
      throw new Error('Invalid response data structure');
    }

    const settings = await loadSettings();
    const users = responseData.response.data.data;
    logger.logApiRequest('TRANSFORM', 'Processing users', { count: users.length });

    return users.map(user => {
      // Base user data
      const baseUser = {
        user_id: user.user_id || '',
        friendly_name: user.friendly_name || '',
        username: user.username || '',
        email: user.email || '',
        is_active: user.is_active || 0,
        is_admin: user.is_admin || 0,
        last_seen: user.last_seen || '',
        total_plays: user.total_plays || 0,
        total_time_watched: user.total_time_watched || 0,
        last_played: user.last_played ? capitalizeWords(user.last_played) : 'Nothing',
      };

      // Add computed fields
      const computedData = {
        ...baseUser,
        minutes: baseUser.last_seen ? 
          Math.floor((Date.now()/1000 - baseUser.last_seen) / 60) : 
          0,
        last_seen_formatted: formatTimeDifference(baseUser.last_seen)
      };

      // Apply format settings templates
      settings.fields.forEach(({ id, template }) => {
        let result = template;
        Object.entries(computedData).forEach(([key, value]) => {
          const regex = new RegExp(`\\$\{${key}}`, 'g');
          result = result.replace(regex, value || '');
        });
        computedData[id] = result;
      });

      return computedData;
    });
  } catch (error) {
    logger.logError('Data Transform', error);
    throw error;
  }
}

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const {
      order_column = 'friendly_name',
      order_dir = 'asc',
      search = '',
      length = 10,
      start = 0
    } = req.query;

    logger.logApiRequest('GET', '/api/users', { 
      order_column, 
      order_dir, 
      search, 
      length, 
      start 
    });

    const response = await axios.get(`${config.baseUrl}/api/v2`, {
      params: {
        apikey: config.apiKey,
        cmd: 'get_users_table',
        order_column,
        order_dir,
        search,
        length,
        start
      }
    });

    logger.logApiResponse(200, response.data);

    const transformedUsers = await transformUserData(response.data);
    logger.logApiRequest('TRANSFORM', 'Transformed users', { count: transformedUsers.length });

    res.json({
      response: {
        result: 'success',
        data: transformedUsers,
        recordsFiltered: response.data.response?.data?.recordsFiltered || 0,
        recordsTotal: response.data.response?.data?.recordsTotal || 0
      }
    });
  } catch (error) {
    logger.logError('Users API', error);
    res.status(500).json({ 
      response: {
        result: 'error',
        message: error.message 
      }
    });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    logger.logApiRequest('GET', `/api/users/${userId}`);

    const response = await axios.get(`${config.baseUrl}/api/v2`, {
      params: {
        apikey: config.apiKey,
        cmd: 'get_user',
        user_id: userId
      }
    });

    logger.logApiResponse(200, response.data);

    const transformedUser = (await transformUserData({
      response: {
        data: {
          data: [response.data.response.data]
        }
      }
    }))[0];

    res.json({
      response: {
        result: 'success',
        data: transformedUser
      }
    });
  } catch (error) {
    logger.logError('User Details API', error);
    res.status(500).json({ 
      response: {
        result: 'error',
        message: error.message 
      }
    });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  logger.logServerStart(PORT, config);
});