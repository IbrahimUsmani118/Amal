# Firebase Cloud Functions - Quran Search & Voice Processing

This directory contains Firebase Cloud Functions for processing voice commands and searching the Quran.

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure OpenAI API Key

Set up the Firebase secret for OpenAI API key:

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

When prompted, enter your OpenAI API key.

### 3. Add Quran Data

Place your `quran-data.json` file in the `functions/` directory (same level as `package.json`). The file should have this structure:

```json
{
  "surahs": [
    {
      "number": 1,
      "name": "Al-Fatiha",
      "ayahs": [
        {
          "number": 1,
          "arabic": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          "english": "In the name of Allah, the Entirely Merciful, the Especially Merciful."
        }
      ]
    }
  ]
}
```

### 4. Deploy Functions

```bash
firebase deploy --only functions
```

## Functions

### `processAudioCommand`
- **Type**: Storage Trigger
- **Trigger**: When a file is uploaded to `voice-commands/{userId}/`
- **Process**:
  1. Downloads the audio file
  2. Transcribes it using OpenAI Whisper
  3. Searches for matching Quran verses
  4. Updates Firestore document at `commands/{fileId}` with results

### `searchQuranText`
- **Type**: HTTP Callable Function
- **Usage**: Search Quran text directly without audio upload
- **Parameters**: `{ query: string }`
- **Returns**: Top 3 matching verses with confidence scores

### `cleanupOldCommands`
- **Type**: Scheduled Function
- **Schedule**: Runs every 24 hours
- **Process**: Deletes audio files and Firestore documents older than 7 days

### `helloWorld`
- **Type**: HTTP Request
- **Purpose**: Test endpoint to verify functions are deployed

## Local Development

```bash
# Start Firebase emulators
npm run serve

# Or use Firebase CLI directly
firebase emulators:start --only functions
```

## Project Structure

```
functions/
├── src/
│   ├── index.js              # Main entry point with all functions
│   └── services/
│       └── quranSearch.js    # Quran search service using Fuse.js
├── package.json
├── .eslintrc.js
└── quran-data.json          # (You need to add this)
```

## Notes

- Functions use Firebase Functions v2 API
- OpenAI API key is stored as a Firebase secret
- Quran data is loaded on function initialization
- All functions are written in JavaScript (CommonJS)

