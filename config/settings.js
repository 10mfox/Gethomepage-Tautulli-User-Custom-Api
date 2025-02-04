const fs = require('fs').promises;
const path = require('path');

const CONFIG_DIR = path.join(__dirname, 'config');
const SETTINGS_FILE = path.join(CONFIG_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  fields: [
    {
      id: 'status_message',
      template: 'Seen [ ${last_seen_formatted} ] Watching ( ${last_played} )'
    }
  ]
};

async function ensureConfigExists() {
  try {
    await fs.access(CONFIG_DIR);
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }

  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
  }
}

async function loadSettings() {
  await ensureConfigExists();
  const data = await fs.readFile(SETTINGS_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveSettings(settings) {
  await ensureConfigExists();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

module.exports = { loadSettings, saveSettings };