# Backend-Frontend Integration Guide

This document describes the complete integration between the React Native frontend and the Node.js backend server.

## Architecture Overview

```
React Native App (Frontend)
    ↓
voiceRecognition.js (Service Layer)
    ↓
backendApi.js (API Client)
    ↓
Backend Server (Node.js/Express)
    ↓
OpenAI Whisper API
```

## Components

### 1. Frontend Services

#### `services/backendApi.js`
- **Purpose**: Centralized API client for all backend communication
- **Features**:
  - Connection testing
  - Audio transcription with progress tracking
  - Automatic retry logic (2 retries with exponential backoff)
  - Error handling
  - Timeout management (60 seconds)

#### `services/voiceRecognition.js`
- **Purpose**: Voice recording and transcription orchestration
- **Features**:
  - Audio recording (expo-av)
  - Upload progress tracking
  - Result/error callbacks
  - Backend connection testing

### 2. Backend Server

#### `backend-server.js`
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /api/info` - API information
  - `POST /transcribe` - Audio transcription

## Features Implemented

### ✅ Upload Progress Tracking
- Real-time progress updates (0-100%)
- Visual progress bar in UI
- Progress callback system

### ✅ Loading States
- Recording state
- Uploading state
- Progress percentage display

### ✅ Error Handling
- Network error detection
- Server error handling
- Retry logic for transient failures
- User-friendly error messages

### ✅ Connection Testing
- Health check endpoint
- Backend connection verification
- Service status reporting

### ✅ Retry Logic
- Automatic retries on network/server errors
- Exponential backoff (1s, 2s, 4s delays)
- Max 2 retries (3 total attempts)
- No retry on client errors (4xx)

## Usage Examples

### Test Backend Connection

```javascript
import { voiceRecognitionService } from '@/services/voiceRecognition';

// Test connection
const result = await voiceRecognitionService.testBackendConnection();
if (result.success) {
  console.log('✅ Backend connected');
} else {
  console.error('❌ Backend connection failed:', result.error);
}
```

### Record and Transcribe

```javascript
// Start recording
await voiceRecognitionService.startListening('en-US');

// Set up callbacks
voiceRecognitionService.setOnResult((result) => {
  console.log('Transcript:', result.transcript);
});

voiceRecognitionService.setOnProgress((progress) => {
  console.log('Upload progress:', progress + '%');
});

voiceRecognitionService.setOnError((error) => {
  console.error('Error:', error);
});

// Stop recording (triggers upload and transcription)
await voiceRecognitionService.stopListening();
```

## UI Integration

The Quran screen (`app/(tabs)/quran.js`) includes:

1. **Voice Recorder UI**
   - Record/Stop button
   - Status text (Listening/Uploading)
   - Progress bar during upload
   - Transcript display

2. **States Managed**
   - `isListening` - Recording active
   - `isUploading` - Upload in progress
   - `uploadProgress` - Progress percentage (0-100)
   - `voiceText` - Current transcript

## Backend API Endpoints

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
Get API information and capabilities.

**Response:**
```json
{
  "name": "Amal Transcription API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "transcribe": "/transcribe",
    "info": "/api/info"
  },
  "features": {
    "transcription": true,
    "progressTracking": true,
    "multipleLanguages": true
  },
  "limits": {
    "maxFileSize": "10MB",
    "allowedFormats": ["m4a", "mp4", "mpeg", "wav", "webm", "aac"]
  }
}
```

### POST /transcribe
Transcribe audio file.

**Request:**
- `multipart/form-data`
- Field: `audio` (file)
- Field: `language` (string, e.g., "en-US")

**Response:**
```json
{
  "text": "Transcribed text here",
  "confidence": 1.0,
  "language": "en-US",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Configuration

### Environment Variables

**Frontend (.env):**
```env
EXPO_PUBLIC_TRANSCRIBE_API_URL=http://localhost:3000/transcribe
```

**Backend (.env):**
```env
PORT=3000
OPENAI_API_KEY=sk-your-api-key-here
```

### Network Configuration

**Local Development:**
- Same computer: `http://localhost:3000`
- Different devices: `http://YOUR_IP:3000`

**Production:**
- Use HTTPS: `https://your-api-domain.com`

## Error Handling

### Network Errors
- Automatic retry (up to 2 retries)
- Exponential backoff
- User-friendly error messages

### Server Errors (5xx)
- Automatic retry
- Error logged to console
- User notification via Alert

### Client Errors (4xx)
- No retry (user error)
- Immediate error notification
- Error message displayed

## Testing

### Test Backend
```bash
# Health check
curl http://localhost:3000/health

# Test transcription
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@test.m4a" \
  -F "language=en-US"
```

### Test Frontend
1. Start backend: `node backend-server.js`
2. Start Expo: `expo start`
3. Open Quran screen
4. Tap microphone button
5. Record audio
6. Stop recording
7. Watch upload progress
8. See transcription result

## Troubleshooting

### "Network request failed"
- Check backend is running
- Verify API URL in `.env`
- Check firewall settings
- Ensure same network (for local network)

### "Upload progress stuck"
- Check network connection
- Verify backend is receiving requests
- Check backend logs

### "Transcription failed"
- Verify OpenAI API key is set
- Check OpenAI account has credits
- Review backend error logs

## Next Steps

Potential enhancements:
- [ ] Caching transcribed results
- [ ] Batch transcription support
- [ ] Audio format conversion
- [ ] Real-time streaming transcription
- [ ] Multiple language detection
- [ ] Transcription history
- [ ] User authentication
- [ ] Rate limiting
- [ ] Analytics tracking

