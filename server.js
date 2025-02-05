const express = require('express');
const axios = require('axios');
const path = require('path');
const logger = require('./logger');
const { loadSettings, saveSettings } = require('./settings');

const app = express();
const PORT = process.env.USER_API_PORT || 3009;

const config = {
  get baseUrl() {
    let url = process.env.TAUTULLI_BASE_URL || '';
    url = url.replace(/\/+$/, '');
    url = url.replace(/\/api\/v2$/, '');
    return url;
  },
  apiKey: process.env.TAUTULLI_API_KEY
};

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

function formatTimeDifference(timestamp) {
  if (!timestamp) return 'Never';
  
  const now = Date.now() / 1000;
  const diffInSeconds = Math.floor(now - timestamp);
  
  if (diffInSeconds < 60) {
    return 'Was Online Just Now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Was Online ${minutes} ${minutes !== 1 ? 'Minutes' : 'Minute'} Ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Was Online ${hours} ${hours !== 1 ? 'Hours' : 'Hour'} Ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `Was Online ${days} ${days !== 1 ? 'Days' : 'Day'} Ago`;
  }
}

app.use(express.json());
app.use(express.static('build'));

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

async function transformUserData(responseData) {
  try {
    if (!responseData?.response?.data?.data) {
      throw new Error('Invalid response data structure');
    }

    // Get current activity data
    const activityResponse = await axios.get(`${config.baseUrl}/api/v2`, {
      params: {
        apikey: config.apiKey,
        cmd: 'get_activity'
      }
    });

    // Create map of currently watching users
    const watchingUsers = {};
    activityResponse.data.response.data.sessions?.forEach(session => {
      if (session.state === 'playing') {
        watchingUsers[session.user_id] = {
          current_media: session.grandparent_title ? `${session.grandparent_title} - ${session.title}` : session.title,
          media_type: capitalizeWords(session.media_type),
          progress_percent: session.progress_percent || '0',
          view_offset: parseFloat(session.view_offset || 0),
          duration: parseFloat(session.duration || 0)
        };
      }
    });

    const settings = await loadSettings();
    const users = responseData.response.data.data;
    logger.logApiRequest('TRANSFORM', 'Processing users', { count: users.length });

    return users.map(user => {
      const watching = watchingUsers[user.user_id];
      const baseUser = {
        user_id: user.user_id || '',
        friendly_name: user.friendly_name || '',
        username: user.username || '',
        email: user.email || '',
        is_active: user.is_active || 0,
        is_admin: user.is_admin || 0,
        last_seen: user.last_seen || '',
        total_plays: parseInt(user.plays || '0', 10),
        total_time_watched: parseInt(user.total_time_watched || 0, 10),
        is_watching: watching ? 'Watching' : 'Watched',
        last_played: watching ? capitalizeWords(watching.current_media) : (user.last_played ? capitalizeWords(user.last_played) : 'Nothing'),
        media_type: watching ? watching.media_type : (user.media_type ? capitalizeWords(user.media_type) : ''),
        progress_percent: watching ? `${watching.progress_percent}%` : '',
        progress_time: watching ? `${formatTime(watching.view_offset)} / ${formatTime(watching.duration)}` : ''
      };

      const computedData = {
        ...baseUser,
        minutes: baseUser.last_seen ? 
          Math.floor((Date.now()/1000 - baseUser.last_seen) / 60) : 
          0,
        last_seen_formatted: watching ? '🟢' : formatTimeDifference(baseUser.last_seen)
      };

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

    const userResponse = await axios.get(`${config.baseUrl}/api/v2`, {
      params: {
        apikey: config.apiKey,
        cmd: 'get_user',
        user_id: userId
      }
    });

    const watchTimeResponse = await axios.get(`${config.baseUrl}/api/v2`, {
      params: {
        apikey: config.apiKey,
        cmd: 'get_user_watch_time_stats',
        user_id: userId,
        query_days: 'all'
      }
    });

    const userData = userResponse.data.response.data;
    const watchStats = watchTimeResponse.data.response.data;

    const totalSeconds = watchStats?.[0]?.total_time || 0;
    const totalMinutes = Math.floor(parseInt(totalSeconds, 10) / 60);

    const transformedUser = (await transformUserData({
      response: {
        data: {
          data: [{
            ...userData,
            total_time_watched: totalMinutes
          }]
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
    res.status(500).json({ 
      response: {
        result: 'error',
        message: error.message 
      }
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  logger.logServerStart(PORT, config);
});