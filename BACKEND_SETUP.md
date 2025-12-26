# Backend Server Setup for Audio Transcription

This guide will help you set up the backend server for audio transcription with CORS and file upload middleware.

## Quick Start

### 1. Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Configure Environment Variables

```bash
# From the backend directory, copy the example env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# Get your API key from: https://platform.openai.com/api-keys
```

Edit `backend/.env`:
```env
PORT=3000
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Start the Backend Server

```bash
# From the backend directory
npm start

# Or with auto-reload (if you installed nodemon)
npm run dev
```

You should see:
```
🚀 Transcription server running on port 3000
📡 Server accessible at:
   - http://localhost:3000
   - http://0.0.0.0:3000
```

### 4. Configure React Native App

#### Option A: Local Development (Same Computer)

If running Expo on the same computer as the backend:

```bash
# In your React Native project root, create or edit .env
echo "EXPO_PUBLIC_TRANSCRIBE_API_URL=http://localhost:3000/transcribe" > .env
```

#### Option B: Local Network (Different Devices)

1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. Update `.env` in your React Native project:
   ```env
   EXPO_PUBLIC_TRANSCRIBE_API_URL=http://192.168.1.5:3000/transcribe
   ```
   (Replace `192.168.1.5` with your actual IP)

3. Make sure both devices are on the same WiFi network

#### Option C: Production/Remote Server

```env
EXPO_PUBLIC_TRANSCRIBE_API_URL=https://your-api-domain.com/transcribe
```

### 5. Restart Expo

After setting the environment variable:

```bash
# Stop Expo (Ctrl+C)
# Clear cache and restart
expo start --clear
```

## Testing

### Test Backend Directly

```bash
# Health check
curl http://localhost:3000/health

# Test transcription (replace with actual audio file)
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@/path/to/audio.m4a" \
  -F "language=en-US"
```

### Test from React Native App

1. Open your app in Expo Go
2. Navigate to the Quran screen
3. Tap the microphone button
4. Start recording
5. Stop recording
6. Check console logs for upload progress

## CORS Configuration

The backend is configured to allow requests from:
- `localhost` (Expo web)
- `exp://` URLs (Expo Go)
- Local network IPs (192.168.*)
- All origins in development mode

For production, update `corsOptions` in `backend-server.js` to restrict origins.

## File Upload Limits

- Maximum file size: 10MB
- Allowed formats: m4a, mp4, mpeg, wav, webm, aac
- Files are automatically deleted after processing

## Troubleshooting

### "Network request failed"
- Check that backend server is running
- Verify the API URL in `.env` matches your server
- For local network, ensure both devices are on same WiFi
- Check firewall isn't blocking port 3000

### "CORS error"
- Backend should allow all origins in dev mode (already configured)
- Make sure CORS middleware is enabled
- Check browser console for specific CORS error

### "No audio file provided"
- Check that FormData is being created correctly
- Verify file URI is accessible
- Check backend logs for file upload details

### "OpenAI API error"
- Verify your API key is correct in `.env`
- Check you have credits in your OpenAI account
- Ensure API key has access to Whisper API

## Security Notes

⚠️ **For Production:**
1. Restrict CORS origins to your app domains only
2. Add authentication/API keys for the `/transcribe` endpoint
3. Use HTTPS for all API calls
4. Implement rate limiting
5. Validate and sanitize all inputs
6. Store API keys securely (never commit to git)

## Alternative Transcription Services

### Google Cloud Speech-to-Text

1. Install: `npm install @google-cloud/speech`
2. Set up credentials: https://cloud.google.com/speech-to-text/docs/quickstart
3. Update `backend-server.js` to use Google Cloud instead of OpenAI

### AWS Transcribe

1. Install: `npm install @aws-sdk/client-transcribe`
2. Configure AWS credentials
3. Update backend code accordingly

## Next Steps

- [ ] Set up OpenAI API key
- [ ] Configure `.env` files
- [ ] Start backend server
- [ ] Update React Native app `.env`
- [ ] Test recording and transcription
- [ ] Deploy backend to production (Heroku, Railway, etc.)

