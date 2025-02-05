# Tautulli User Activity API Manager

A web application that allows you to customize and manage user activity data from Tautulli, featuring a dynamic templating system for formatting user status messages.

![users](https://github.com/user-attachments/assets/fdf9a8d7-b5dd-4d6f-9a3f-39ad54fbd962)
![settings](https://github.com/user-attachments/assets/ba304334-057c-4afb-bf7e-cc577c262c21)

## Features

- Real-time status updates for currently watching users including:
  - Progress percentage and timestamps
  - Media type (Movie/TV Show)
  - Content title with episode info for TV Shows
- Customizable display templates with dynamic variable support
- Sorting and filtering of user activity
- Last seen time tracking with automatic formatting
- Watch time statistics and play counts
- Dark mode responsive UI optimized for desktop and mobile
- Docker deployment with config persistence

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
    volumes:
      - ./config:/app/config
    restart: unless-stopped
```

3. Start the service:
```bash
docker-compose up -d
```

4. Access the web UI at `http://localhost:3009`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| USER_API_PORT | Port for the web service | 3009 |
| TAUTULLI_BASE_URL | URL of your Tautulli server | - |
| TAUTULLI_API_KEY | Your Tautulli API key | - |

## API Endpoints

### GET /api/users
Returns a list of users with their current status and activity information.

### Response Format

```json
{
  "response": {
    "result": "success",
    "data": [
      {
        "user_id": "1",
        "friendly_name": "User1",
        "username": "user1",
        "email": "user1@example.com",
        "is_active": 1,
        "is_admin": 0,
        "last_seen": "1234567890",
        "total_plays": 150,
        "total_time_watched": 12345,
        "is_watching": "Watching",
        "last_played": "The Matrix",
        "media_type": "Movie",
        "progress_percent": "10%",
        "progress_time": "10:21 / 60:00",
        "minutes": 60,
        "last_seen_formatted": "Now",
        "status_message": "Watching ( The Matrix )"
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
| ${last_played} | Currently watching or last watched title |
| ${media_type} | Type of media (Movie/TV Show) |
| ${last_seen_formatted} | Now (if watching) or last seen time |
| ${is_watching} | Current status (Watching/Watched) |
| ${progress_percent} | Current progress (e.g., "10%") |
| ${progress_time} | Current time / total time (e.g., "10:21 / 60:00") |

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License

## Note

This project is not affiliated with Tautulli or Plex Inc.
