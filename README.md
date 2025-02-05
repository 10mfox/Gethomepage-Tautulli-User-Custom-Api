# Tautulli User Activity API Manager

A web application that allows you to customize and manage user activity data from Tautulli, featuring a dynamic templating system for formatting user status messages.

![users](https://github.com/user-attachments/assets/88544591-cb6e-49e5-9e04-7c7c49d6aa77)
![settings](https://github.com/user-attachments/assets/4b941448-78ed-4d8b-9d1e-73a471a1f561)





## Features

- Customizable user activity display templates
- Real-time preview of formatting changes
- Dynamic user status messages
- User activity dashboard with sorting and filtering
- Dark mode UI with responsive design
- Docker support

## Prerequisites

- Tautulli server running and accessible
- Tautulli API key
- Docker (for containerized deployment)

## Quick Start

1. Pull the Docker image:
```bash
docker pull ghcr.io/10mfox/gethomepage-tautulli-user-custom-api:beta
```

2. Create a docker-compose.yml:
```yaml
version: '3'
services:
  tautulli-user-api:
    image: ghcr.io/10mfox/gethomepage-tautulli-user-custom-api:beta
    container_name: tautulli-user-api
    environment:
      - USER_API_PORT=3009
      - TAUTULLI_BASE_URL=http://your-tautulli-host:8181
      - TAUTULLI_API_KEY=your_tautulli_api_key
    ports:
      - "3009:3009"
    restart: unless-stopped
```

3. Start the service:
```bash
docker-compose up -d
```

4. Access the web UI at `http://localhost:3009`

## Settings Persistence

Format settings are automatically stored in `/app/config/settings.json` and persist across container restarts. The config directory can be mounted as a volume to maintain settings:

```yaml
volumes:
  - ./config:/app/config
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| USER_API_PORT | Port for the web service | 3009 |
| TAUTULLI_BASE_URL | URL of your Tautulli server | - |
| TAUTULLI_API_KEY | Your Tautulli API key | - |

## API Endpoints

### Users
```
GET /api/users
```

### Response Format

```json
{
  "response": {
    "result": "success",
    "data": [
      {
        "user_id": "1",
        "friendly_name": "User1",
        "last_seen": "1234567890",
        "last_seen_formatted": "2 hours ago",
        "total_plays": 150,
        "status_message": "Seen [ 2 hours ago ] Watching ( The Matrix )"
      }
    ]
  }
}
```

## Available Template Variables

| Variable | Description |
|----------|-------------|
| ${friendly_name} | Display name |
| ${total_plays} | Total play count |
| ${last_played} | Last played title |
| ${media_type} | Type of media (Movie/TV Show) |
| ${last_seen_formatted} | Formatted last seen time |

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License

## Note

This project is not affiliated with Tautulli or Plex Inc.
