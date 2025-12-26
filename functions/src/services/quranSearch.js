const Fuse = require("fuse.js");

/**
 * Service for searching Quran verses using fuzzy search
 * Handles both Arabic and English text matching
 */
class QuranSearchService {
  constructor() {
    this.fuse = null;
    this.verses = [];
    this.dataLoaded = false;
  }

  /**
   * Loads Quran data from JSON file and initializes the search index
   * @param {Object} quranData - The Quran dataset in JSON format
   */
  loadData(quranData) {
    // Flatten the nested structure into a simple array of verses
    this.verses = [];
    
    for (const surah of quranData.surahs) {
      for (const ayah of surah.ayahs) {
        this.verses.push({
          surah: surah.number,
          ayah: ayah.number,
          arabic: ayah.arabic,
          english: ayah.english,
        });
      }
    }

    // Configure Fuse.js for fuzzy search
    // Search both Arabic and English fields with appropriate weights
    const fuseOptions = {
      keys: [
        { name: "arabic", weight: 0.5 },
        { name: "english", weight: 0.5 },
      ],
      threshold: 0.4, // Lower threshold = more strict matching (0.0 = exact, 1.0 = match anything)
      includeScore: true,
      minMatchCharLength: 2,
    };

    this.fuse = new Fuse(this.verses, fuseOptions);
    this.dataLoaded = true;
  }

  /**
   * Finds the top matching verses for the given search text
   * @param {string} text - The search query text
   * @param {number} limit - Maximum number of results to return (default: 3)
   * @returns {Array} Array of search results with confidence scores
   */
  findVerse(text, limit = 3) {
    if (!this.dataLoaded || !this.fuse) {
      throw new Error("Quran data not loaded. Call loadData() first.");
    }

    if (!text || text.trim().length === 0) {
      return [];
    }

    // Perform fuzzy search
    const searchResults = this.fuse.search(text, { limit });

    // Transform results to include confidence scores
    // Fuse.js returns scores where 0 = perfect match, 1 = no match
    // We'll convert this to a confidence percentage (0-100)
    return searchResults.map((result) => {
      const verse = result.item;
      // Convert score to confidence: lower score = higher confidence
      const confidence = Math.max(0, Math.min(100, (1 - result.score) * 100));

      return {
        surah: verse.surah,
        ayah: verse.ayah,
        arabic: verse.arabic,
        english: verse.english,
        confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
      };
    });
  }

  /**
   * Checks if the service has loaded data
   * @returns {boolean}
   */
  isDataLoaded() {
    return this.dataLoaded;
  }

  /**
   * Gets the total number of verses loaded
   * @returns {number}
   */
  getVerseCount() {
    return this.verses.length;
  }
}

module.exports = { QuranSearchService };

