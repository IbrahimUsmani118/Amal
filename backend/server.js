// Backend Server for Audio Transcription
// Run with: node server.js (from backend directory)
// Or: npm start (from backend directory)
// Make sure to install dependencies: npm install

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== CORS Configuration ====================
// Allow requests from your React Native app (Expo Go, development builds, etc.)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins (add your production domain here)
    const allowedOrigins = [
      'http://localhost:8081', // Expo web
      'http://localhost:19006', // Expo web alternative
      'exp://localhost:8081', // Expo Go
      'exp://192.168.*', // Local network (Expo Go)
      // Add your production domains here
      // 'https://your-app.com',
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = new RegExp('^' + allowed.replace(/\*/g, '.*'));
        return pattern.test(origin);
      }
      return origin === allowed;
    });
    
    if (isAllowed || !origin) {
      callback(null, true);
    } else {
      // For development, allow all origins (remove in production)
      console.log('⚠️ Allowing origin (dev mode):', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// ==================== Middleware ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname || '.m4a'));
  }
});

// File filter - only accept audio files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/m4a',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
    'audio/aac',
    'audio/x-m4a',
  ];
  
  if (allowedMimes.includes(file.mimetype) || !file.mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// ==================== Routes ====================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Transcription server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      transcription: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
    }
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Amal Transcription API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      transcribe: '/transcribe',
      info: '/api/info',
    },
    features: {
      transcription: true,
      progressTracking: true,
      multipleLanguages: true,
    },
    limits: {
      maxFileSize: '10MB',
      allowedFormats: ['m4a', 'mp4', 'mpeg', 'wav', 'webm', 'aac'],
    }
  });
});

// Transcription endpoint
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No audio file provided',
        message: 'Please upload an audio file' 
      });
    }

    const filePath = req.file.path;
    const language = req.body.language || 'en-US';
    
    console.log('📥 Received audio file:', req.file.filename);
    console.log('🌐 Language:', language);
    console.log('📊 File size:', req.file.size, 'bytes');

    // ==================== Transcription Service ====================
    // Option 1: OpenAI Whisper API (Recommended)
    let transcription = null;
    
    if (process.env.OPENAI_API_KEY) {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      try {
        const transcriptionResponse = await openai.audio.transcriptions.create({
          file: fs.createReadStream(filePath),
          model: 'whisper-1',
          language: language.split('-')[0], // Convert 'en-US' to 'en'
          response_format: 'json',
        });
        
        transcription = transcriptionResponse.text;
        console.log('✅ Transcription (OpenAI):', transcription);
      } catch (openaiError) {
        console.error('❌ OpenAI error:', openaiError);
        throw new Error('OpenAI transcription failed: ' + openaiError.message);
      }
    } 
    // Option 2: Google Cloud Speech-to-Text (Alternative)
    else if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
      // Uncomment and configure if using Google Cloud
      // const speech = require('@google-cloud/speech');
      // const client = new speech.SpeechClient();
      // ... Google Cloud implementation
      throw new Error('Google Cloud not configured. Set OPENAI_API_KEY instead.');
    }
    // Option 3: Fallback - return placeholder
    else {
      console.warn('⚠️ No transcription service configured');
      transcription = '[Transcription service not configured. Set OPENAI_API_KEY in .env]';
    }

    // Cleanup: Delete the uploaded file after processing
    fs.unlinkSync(filePath);
    console.log('🧹 Cleaned up temporary file:', filePath);

    // Return transcription result
    res.json({
      text: transcription,
      confidence: 1.0,
      language: language,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Transcription error:', error);
    
    // Cleanup on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({
      error: 'Transcription failed',
      message: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Audio file must be less than 10MB'
      });
    }
  }
  
  res.status(500).json({
    error: 'Server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Transcription server running on port', PORT);
  console.log('📡 Server accessible at:');
  console.log(`   - http://localhost:${PORT}`);
  console.log(`   - http://0.0.0.0:${PORT}`);
  console.log('\n📝 Make sure to:');
  console.log('   1. Set OPENAI_API_KEY in .env file');
  console.log('   2. Update EXPO_PUBLIC_TRANSCRIBE_API_URL in your React Native app');
  console.log('   3. For local network, use your computer\'s IP address');
});

