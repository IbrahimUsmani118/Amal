# Backend Server

Backend server for audio transcription using OpenAI Whisper API.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# Get your API key from: https://platform.openai.com/api-keys
```

Edit `.env`:
```env
PORT=3000
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Start Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Transcription server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "transcription": "configured"
  }
}
```

### GET /api/info
Get API information.

### POST /transcribe
Transcribe audio file.

**Request:**
- `multipart/form-data`
- Field: `audio` (file)
- Field: `language` (string, optional, default: "en-US")

**Response:**
```json
{
  "text": "Transcribed text here",
  "confidence": 1.0,
  "language": "en-US",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## File Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env.example       # Environment variables template
├── .env              # Your environment variables (not in git)
├── uploads/          # Temporary audio files (auto-created)
└── README.md         # This file
```

## Configuration

### Port
Default: `3000`
Change in `.env`: `PORT=3000`

### File Upload Limits
- Max file size: 10MB
- Allowed formats: m4a, mp4, mpeg, wav, webm, aac

### CORS
Configured to allow requests from:
- Localhost (development)
- Expo Go
- Local network IPs
- All origins in development mode

## Development

### Auto-reload
Install nodemon globally or use:
```bash
npm run dev
```

### Testing

```bash
# Health check
curl http://localhost:3000/health

# Test transcription
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@test.m4a" \
  -F "language=en-US"
```

## Production Deployment

1. Set environment variables on your hosting platform
2. Update CORS origins in `server.js` to restrict access
3. Use HTTPS
4. Add authentication/API keys
5. Set up rate limiting
6. Monitor logs and errors

## Troubleshooting

### Port already in use
Change PORT in `.env` or kill the process using port 3000

### OpenAI API errors
- Verify API key is correct
- Check you have credits in OpenAI account
- Ensure API key has access to Whisper API

### File upload fails
- Check file size (max 10MB)
- Verify file format is supported
- Check uploads directory permissions

