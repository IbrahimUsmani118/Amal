const {onObjectFinalized} = require("firebase-functions/v2/storage");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {defineSecret} = require("firebase-functions/params");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Storage} = require("@google-cloud/storage");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const os = require("os");
const {QuranSearchService} = require("./services/quranSearch");

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Google Cloud Storage
const storage = new Storage();

// Define Firebase Functions v2 secret for OpenAI API key
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// Initialize OpenAI client
// Note: The secret will be available at runtime via the function's config
let openai = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY secret is not configured");
    }
    openai = new OpenAI({apiKey});
  }
  return openai;
}

// Initialize Quran Search Service
const quranSearchService = new QuranSearchService();

// Load Quran data on function initialization
// Note: You'll need to provide quran-data.json file
let quranDataLoaded = false;

async function loadQuranData() {
  if (quranDataLoaded) return;
  
  try {
    const quranDataPath = path.join(__dirname, "../quran-data.json");
    if (fs.existsSync(quranDataPath)) {
      const quranData = JSON.parse(fs.readFileSync(quranDataPath, "utf-8"));
      quranSearchService.loadData(quranData);
      quranDataLoaded = true;
      console.log("Quran data loaded successfully");
    } else {
      console.warn("quran-data.json not found. Please provide the file.");
    }
  } catch (error) {
    console.error("Error loading Quran data:", error);
  }
}

// Load data on module initialization
loadQuranData().catch(console.error);

/**
 * Storage trigger that processes audio files uploaded to voice-commands/{userId}/
 * Downloads the file, transcribes it with Whisper, searches for matching Quran verses,
 * and updates Firestore with the results
 */
exports.processAudioCommand = onObjectFinalized(
  {
    secrets: [openaiApiKey],
    memory: "512MiB",
    timeoutSeconds: 540,
  },
  async (event) => {
    const filePath = event.data.name;
    const bucketName = event.data.bucket;

    // Only process files in voice-commands/{userId}/ path
    if (!filePath || !filePath.startsWith("voice-commands/")) {
      console.log("File not in voice-commands path, skipping:", filePath);
      return null;
    }

    // Extract userId and fileId from path: voice-commands/{userId}/{fileId}
    const pathParts = filePath.split("/");
    if (pathParts.length < 3) {
      console.log("Invalid path structure, skipping:", filePath);
      return null;
    }

    const userId = pathParts[1];
    const fileId = pathParts[2].replace(/\.[^/.]+$/, ""); // Remove file extension

    console.log(`Processing audio command: userId=${userId}, fileId=${fileId}`);

    // Create Firestore document reference
    const commandRef = admin.firestore().collection("commands").doc(fileId);

    try {
      // Update status to processing
      await commandRef.set({
        status: "processing",
        userId: userId,
        filePath: filePath,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});

      // Ensure Quran data is loaded
      await loadQuranData();
      if (!quranSearchService.isDataLoaded()) {
        throw new Error("Quran data not available");
      }

      // Download file to temporary location
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(filePath);
      const tempFilePath = path.join(os.tmpdir(), `${fileId}-${Date.now()}`);
      
      await file.download({destination: tempFilePath});
      console.log(`Downloaded file to: ${tempFilePath}`);

      // Get OpenAI client
      const openaiClient = getOpenAIClient();

      // Transcribe audio using OpenAI Whisper
      const transcriptionResponse = await openaiClient.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        language: "en", // Adjust if needed for Arabic/other languages
      });

      const transcript = transcriptionResponse.text;
      console.log(`Transcription: ${transcript}`);

      // Search for matching Quran verses
      const searchResults = quranSearchService.findVerse(transcript, 3);

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      // Update Firestore with results
      await commandRef.set({
        status: "completed",
        transcript: transcript,
        matches: searchResults.map((result) => ({
          surah: result.surah,
          ayah: result.ayah,
          arabic: result.arabic,
          english: result.english,
          confidence: result.confidence,
        })),
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});

      console.log(`Successfully processed audio command: ${fileId}`);
      return null;
    } catch (error) {
      console.error(`Error processing audio command ${fileId}:`, error);
      
      // Update Firestore with error status
      await commandRef.set({
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        errorAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true}).catch((err) => {
        console.error("Failed to update error status:", err);
      });

      // Clean up temporary file if it exists
      const tempFilePath = path.join(os.tmpdir(), `${fileId}-${Date.now()}`);
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkError) {
          console.error("Failed to clean up temp file:", unlinkError);
        }
      }

      return null;
    }
  }
);

/**
 * HTTP Callable Function for searching Quran text directly
 * Allows the app to search for verses without uploading audio
 */
exports.searchQuranText = onCall(
  {
    secrets: [openaiApiKey],
  },
  async (request) => {
    const {data, auth} = request;

    // Ensure user is authenticated (optional - remove if you want public access)
    if (!auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to search Quran"
      );
    }

    // Validate input
    if (!data || typeof data.query !== "string" || data.query.trim().length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "Query parameter is required and must be a non-empty string"
      );
    }

    try {
      // Ensure Quran data is loaded
      await loadQuranData();
      if (!quranSearchService.isDataLoaded()) {
        throw new HttpsError(
          "internal",
          "Quran data not available"
        );
      }

      // Perform search
      const searchResults = quranSearchService.findVerse(data.query.trim(), 3);

      // Return results
      return {
        success: true,
        query: data.query,
        results: searchResults.map((result) => ({
          surah: result.surah,
          ayah: result.ayah,
          arabic: result.arabic,
          english: result.english,
          confidence: result.confidence,
        })),
        count: searchResults.length,
      };
    } catch (error) {
      console.error("Error in searchQuranText:", error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError(
        "internal",
        "An error occurred while searching the Quran",
        error instanceof Error ? error.message : String(error)
      );
    }
  }
);

/**
 * Scheduled function that runs every 24 hours to clean up old audio files
 * and Firestore documents older than 7 days
 */
exports.cleanupOldCommands = onSchedule(
  {
    schedule: "every 24 hours",
    timeZone: "UTC",
  },
  async (event) => {
    console.log("Starting cleanup of old commands...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      // Clean up Firestore documents
      const commandsRef = admin.firestore().collection("commands");
      const oldCommands = await commandsRef
        .where("createdAt", "<", admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .limit(500) // Process in batches
        .get();

      const batch = admin.firestore().batch();
      let deletedCount = 0;

      for (const doc of oldCommands.docs) {
        const commandData = doc.data();
        
        // Delete the Firestore document
        batch.delete(doc.ref);
        deletedCount++;

        // Delete the associated audio file from Storage if it exists
        if (commandData.filePath) {
          try {
            const bucket = storage.bucket();
            const file = bucket.file(commandData.filePath);
            const [exists] = await file.exists();
            
            if (exists) {
              await file.delete();
              console.log(`Deleted audio file: ${commandData.filePath}`);
            }
          } catch (fileError) {
            console.error(`Error deleting file ${commandData.filePath}:`, fileError);
          }
        }
      }

      if (deletedCount > 0) {
        await batch.commit();
        console.log(`Deleted ${deletedCount} old command documents`);
      } else {
        console.log("No old commands to delete");
      }

      // Also clean up orphaned files in voice-commands/ that don't have Firestore entries
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({
        prefix: "voice-commands/",
      });

      let orphanedCount = 0;
      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const created = new Date(metadata.timeCreated);
        
        if (created < sevenDaysAgo) {
          // Check if there's a corresponding Firestore document
          const fileId = path.basename(file.name, path.extname(file.name));
          const commandDoc = await commandsRef.doc(fileId).get();
          
          if (!commandDoc.exists) {
            await file.delete();
            orphanedCount++;
            console.log(`Deleted orphaned file: ${file.name}`);
          }
        }
      }

      if (orphanedCount > 0) {
        console.log(`Deleted ${orphanedCount} orphaned audio files`);
      }

      console.log("Cleanup completed successfully");
    } catch (error) {
      console.error("Error during cleanup:", error);
      throw error;
    }
  }
);

// Simple test endpoint
exports.helloWorld = onRequest((request, response) => {
  response.json({message: "Firebase Cloud Functions initialized"});
});

/**
 * Storage trigger that processes audio files uploaded to voice-commands/{userId}/{fileId}.m4a
 * Downloads the file, transcribes it with OpenAI Whisper, and saves the transcript to Firestore
 */
exports.onAudioUpload = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const bucketName = object.bucket;

  // Only process files matching voice-commands/{userId}/{fileId}.m4a pattern
  if (!filePath || !filePath.startsWith("voice-commands/")) {
    console.log("File not in voice-commands path, skipping:", filePath);
    return null;
  }

  // Check if file is .m4a format
  if (!filePath.endsWith(".m4a")) {
    console.log("File is not .m4a format, skipping:", filePath);
    return null;
  }

  // Extract userId and fileId from path: voice-commands/{userId}/{fileId}.m4a
  const pathParts = filePath.split("/");
  if (pathParts.length < 3) {
    console.log("Invalid path structure, skipping:", filePath);
    return null;
  }

  const userId = pathParts[1];
  const fileName = pathParts[2];
  const fileId = fileName.replace(/\.m4a$/, ""); // Remove .m4a extension

  console.log(`Processing audio upload: userId=${userId}, fileId=${fileId}`);

  // Create Firestore document reference
  const commandRef = admin.firestore().collection("commands").doc(fileId);

  let tempFilePath = null;

  try {
    // Download file to temporary location
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    tempFilePath = path.join(os.tmpdir(), `${fileId}-${Date.now()}.m4a`);
    
    await file.download({destination: tempFilePath});
    console.log(`Downloaded file to: ${tempFilePath}`);

    // Get OpenAI client
    const openaiClient = getOpenAIClient();

    // Transcribe audio using OpenAI Whisper
    const transcriptionResponse = await openaiClient.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en", // Adjust if needed for Arabic/other languages
    });

    const transcript = transcriptionResponse.text;
    console.log(`Transcription: ${transcript}`);

    // Ensure Quran data is loaded
    await loadQuranData();
    if (!quranSearchService.isDataLoaded()) {
      throw new Error("Quran data not available");
    }

    // Search for the best matching Quran verse
    const searchResults = quranSearchService.findVerse(transcript, 1);
    let quranMatch = null;
    
    if (searchResults && searchResults.length > 0) {
      const bestMatch = searchResults[0];
      quranMatch = {
        surah: bestMatch.surah,
        ayah: bestMatch.ayah,
        arabic: bestMatch.arabic,
        english: bestMatch.english,
        confidence: bestMatch.confidence,
      };
      console.log(`Found matching verse: Surah ${bestMatch.surah}, Ayah ${bestMatch.ayah}`);
    } else {
      console.log("No matching verse found for transcript");
    }

    // Save transcript and quranMatch to Firestore and set status to completed
    const updateData = {
      status: "completed",
      transcript: transcript,
      userId: userId,
      filePath: filePath,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add quranMatch if a match was found
    if (quranMatch) {
      updateData.quranMatch = quranMatch;
    }

    await commandRef.set(updateData, {merge: true});

    console.log(`Successfully processed audio upload: ${fileId}`);
    return null;
  } catch (error) {
    console.error(`Error processing audio upload ${fileId}:`, error);
    
    // Update Firestore with error status
    await commandRef.set({
      status: "error",
      error: error instanceof Error ? error.message : String(error),
      errorAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true}).catch((err) => {
      console.error("Failed to update error status:", err);
    });

    return null;
  } finally {
    // Clean up temporary file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`Cleaned up temp file: ${tempFilePath}`);
      } catch (unlinkError) {
        console.error("Failed to clean up temp file:", unlinkError);
      }
    }
  }
});

