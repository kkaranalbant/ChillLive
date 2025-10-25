# Chat App Backend

Backend server for video chat application built with Node.js, Express, Socket.io, and MongoDB.

## Features

- User authentication (JWT + Guest mode)
- Real-time matching algorithm
- WebRTC signaling server
- User preferences and filters
- Reporting system
- Rate limiting

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Make sure MongoDB is running

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/guest` - Guest login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/preferences` - Update preferences

### Reports
- `POST /api/reports` - Create report
- `GET /api/reports` - Get all reports

## Socket Events

### Client → Server
- `find-match` - Start finding a match
- `signal` - WebRTC signaling
- `chat-message` - Send text message
- `skip-partner` - Skip current partner
- `end-chat` - End current chat

### Server → Client
- `match-found` - Match found
- `waiting-for-match` - Waiting in queue
- `signal` - WebRTC signal from partner
- `chat-message` - Message from partner
- `partner-skipped` - Partner skipped
- `partner-disconnected` - Partner disconnected
- `chat-ended` - Chat ended
