// Quran API Service
// Handles all API calls to Al-Quran Cloud API

const API_BASE = 'http://api.alquran.cloud/v1';

export const EDITIONS = {
  arabic: 'quran-uthmani',
  english: 'en.asad',
  audio: 'ar.alafasy',
  pickthall: 'en.pickthall',
  yusufali: 'en.yusufali'
};

export class QuranApiService {
  // Fetch a complete surah with Arabic text and English translation
  async fetchSurah(surahNumber) {
    try {
      const [arabicResponse, englishResponse] = await Promise.all([
        fetch(`${API_BASE}/surah/${surahNumber}/${EDITIONS.arabic}`),
        fetch(`${API_BASE}/surah/${surahNumber}/${EDITIONS.english}`)
      ]);

      const arabicData = await arabicResponse.json();
      const englishData = await englishResponse.json();

      if (arabicData.code !== 200 || englishData.code !== 200) {
        throw new Error('Failed to fetch surah data');
      }

      const ayahs = arabicData.data.ayahs.map((ayah, index) => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        translation: englishData.data.ayahs[index]?.text || '',
        audio: `${API_BASE}/ayah/${ayah.number}/${EDITIONS.audio}`,
        surahNumber,
        ayahNumber: ayah.number
      }));

      return {
        number: surahNumber,
        name: arabicData.data.name,
        nameTranslated: arabicData.data.englishName,
        nameEnglish: arabicData.data.englishNameTranslation,
        ayahs,
        totalAyahs: arabicData.data.numberOfAyahs,
        revelationType: arabicData.data.revelationType,
        revelationPlace: arabicData.data.revelationPlace
      };
    } catch (error) {
      console.error('Error fetching surah:', error);
      throw error;
    }
  }

  // Fetch a specific ayah
  async fetchAyah(reference, edition = EDITIONS.arabic) {
    try {
      const response = await fetch(`${API_BASE}/ayah/${reference}/${edition}`);
      const data = await response.json();

      if (data.code !== 200) {
        throw new Error('Failed to fetch ayah');
      }

      return {
        number: data.data.numberInSurah,
        text: data.data.text,
        translation: '',
        surahNumber: data.data.surah.number,
        ayahNumber: data.data.number
      };
    } catch (error) {
      console.error('Error fetching ayah:', error);
      throw error;
    }
  }

  // Fetch multiple editions of an ayah
  async fetchAyahMultipleEditions(reference, editions) {
    try {
      const editionsParam = editions.join(',');
      const response = await fetch(`${API_BASE}/ayah/${reference}/editions/${editionsParam}`);
      const data = await response.json();

      if (data.code !== 200) {
        throw new Error('Failed to fetch ayah editions');
      }

      return data.data.map((ayah) => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        translation: ayah.edition.includes('en.') ? ayah.text : '',
        surahNumber: ayah.surah.number,
        ayahNumber: ayah.number
      }));
    } catch (error) {
      console.error('Error fetching ayah editions:', error);
      throw error;
    }
  }

  // Search Quran for keywords
  async searchQuran(keyword, surahNumber, edition) {
    try {
      if (!keyword || keyword.trim().length === 0) {
        return [];
      }

      const surahParam = surahNumber ? surahNumber.toString() : 'all';
      const editionParam = edition || EDITIONS.english;
      
      // URL encode the keyword to handle special characters
      const encodedKeyword = encodeURIComponent(keyword.trim());
      const url = `${API_BASE}/search/${encodedKeyword}/${surahParam}/${editionParam}`;
      
      console.log('Searching Quran:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Search API returned status ${response.status}`);
      }

      const data = await response.json();

      // Handle different response formats
      if (data.code !== 200) {
        console.warn('Search API returned non-200 code:', data.code, data);
        // Return empty array instead of throwing
        return [];
      }

      // Check if data.data exists
      if (!data.data) {
        console.warn('Search API response missing data field:', data);
        return [];
      }

      // Handle different response structures
      // API can return: {code: 200, data: [...]} or {code: 200, data: {count: N, matches: [...]}}
      let resultsArray = [];
      
      if (Array.isArray(data.data)) {
        // Direct array format
        resultsArray = data.data;
      } else if (data.data.matches && Array.isArray(data.data.matches)) {
        // Object with matches array format
        resultsArray = data.data.matches;
      } else {
        console.warn('Search API data is not in expected format:', typeof data.data, data.data);
        return [];
      }

      // Map results safely
      return resultsArray.map((result) => ({
        ayah: result.numberInSurah || result.ayah || 1,
        surah: result.surah?.number || result.surah || 1,
        text: result.text || '',
        edition: result.edition || editionParam
      }));
    } catch (error) {
      console.error('Search error:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }

  // Get audio recitation URL
  getAudioUrl(ayahNumber, edition = EDITIONS.audio) {
    return `${API_BASE}/ayah/${ayahNumber}/${edition}`;
  }

  // Get all surahs list
  async getAllSurahs() {
    try {
      const response = await fetch(`${API_BASE}/surah`);
      const data = await response.json();

      if (data.code !== 200) {
        throw new Error('Failed to fetch surahs list');
      }

      return data.data.map((surah) => ({
        number: surah.number,
        name: surah.englishName,
        arabicName: surah.name,
        nameTranslated: surah.englishName,
        nameEnglish: surah.englishNameTranslation,
        numberOfAyahs: surah.numberOfAyahs
      }));
    } catch (error) {
      console.error('Error fetching surahs list:', error);
      throw error;
    }
  }

  // Enhanced voice command parser with real-time Quran text matching
  parseVoiceCommand(command, surahsList = []) {
    const lowerCommand = command.toLowerCase().trim();

    // Parse surah selection by number
    if (lowerCommand.includes('surah') || lowerCommand.includes('chapter')) {
      const surahMatch = lowerCommand.match(/(\d+)/);
      if (surahMatch) {
        const surahNumber = parseInt(surahMatch[1]);
        if (surahNumber >= 1 && surahNumber <= 114) {
          return { action: 'selectSurah', params: { surahNumber } };
        }
      }
      
      // Parse surah selection by name
      if (surahsList.length > 0) {
        for (const surah of surahsList) {
          const surahNameLower = (surah.nameEnglish || surah.name || '').toLowerCase();
          const arabicNameLower = (surah.arabicName || surah.name || '').toLowerCase();
          
          // Check if command contains surah name
          if (lowerCommand.includes(surahNameLower) || 
              lowerCommand.includes(arabicNameLower) ||
              surahNameLower.includes(lowerCommand.replace(/surah|chapter|go to|open/gi, '').trim())) {
            return { action: 'selectSurah', params: { surahNumber: surah.number } };
          }
        }
      }
    }

    // Parse search commands
    if (lowerCommand.includes('search') || lowerCommand.includes('find')) {
      const searchTerm = lowerCommand.replace(/(search|find)/gi, '').trim();
      if (searchTerm) {
        return { action: 'search', params: { keyword: searchTerm } };
      }
    }

    // Parse ayah selection commands
    if (lowerCommand.includes('ayah') || lowerCommand.includes('verse')) {
      const ayahMatch = lowerCommand.match(/(\d+):(\d+)/);
      if (ayahMatch) {
        const surahNumber = parseInt(ayahMatch[1]);
        const ayahNumber = parseInt(ayahMatch[2]);
        if (surahNumber >= 1 && surahNumber <= 114) {
          return { action: 'selectAyah', params: { surahNumber, ayahNumber } };
        }
      }
    }

    // Parse navigation commands
    if (lowerCommand.includes('next') || lowerCommand.includes('forward')) {
      return { action: 'next', params: {} };
    }

    if (lowerCommand.includes('previous') || lowerCommand.includes('back')) {
      return { action: 'previous', params: {} };
    }

    return { action: 'unknown', params: {} };
  }

  // Real-time Quran text matching for voice recognition
  async matchQuranText(transcript) {
    try {
      const lowerTranscript = transcript.toLowerCase();
      
      // Common Quran phrases and their surah/ayah references
      const commonPhrases = {
        'bismillah': { surah: 1, ayah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
        'bismillah al-rahman al-rahim': { surah: 1, ayah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
        'alhamdulillah': { surah: 1, ayah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
        'alhamdulillah rabbil alameen': { surah: 1, ayah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
        'maliki yawmi deen': { surah: 1, ayah: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
        'iyyaka na budu': { surah: 1, ayah: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
        'ihdina sirat al mustaqim': { surah: 1, ayah: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
        'sirat alladhina an amta alayhim': { surah: 1, ayah: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ' },
        'ghayr al maghdubi alayhim': { surah: 1, ayah: 7, text: 'غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ' },
        'wa la ad daleen': { surah: 1, ayah: 7, text: 'وَلَا الضَّالِّينَ' },
        'amin': { surah: 1, ayah: 7, text: 'آمِينَ' },
        'la ilaha illa allah': { surah: 47, ayah: 19, text: 'لَا إِلَٰهَ إِلَّا اللَّهُ' },
        'muhammad rasul allah': { surah: 48, ayah: 29, text: 'مُحَمَّدٌ رَسُولُ اللَّهِ' },
        'subhan allah': { surah: 17, ayah: 1, text: 'سُبْحَانَ اللَّهِ' },
        'alhamdulillah': { surah: 1, ayah: 2, text: 'الْحَمْدُ لِلَّهِ' },
        'allahu akbar': { surah: 17, ayah: 111, text: 'اللَّهُ أَكْبَرُ' },
        'astaghfirullah': { surah: 3, ayah: 135, text: 'أَسْتَغْفِرُ اللَّهَ' },
        'inna lillahi wa inna ilayhi rajiun': { surah: 2, ayah: 156, text: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ' },
        'hasbunallahu wa ni mal wakeel': { surah: 3, ayah: 173, text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ' },
        'la hawla wa la quwwata illa billah': { surah: 18, ayah: 39, text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ' }
      };

      // Check for exact matches first
      for (const [phrase, data] of Object.entries(commonPhrases)) {
        if (lowerTranscript.includes(phrase)) {
          return {
            surah: data.surah,
            ayah: data.ayah,
            surahName: this.getSurahName(data.surah),
            ayahText: data.text,
            confidence: 0.9,
            matchType: 'exact'
          };
        }
      }

      // If no exact match, try fuzzy matching
      const fuzzyMatches = [];
      for (const [phrase, data] of Object.entries(commonPhrases)) {
        const similarity = this.calculateSimilarity(lowerTranscript, phrase);
        if (similarity > 0.6) { // 60% similarity threshold
          fuzzyMatches.push({
            phrase,
            data,
            similarity
          });
        }
      }

      if (fuzzyMatches.length > 0) {
        // Return the best match
        const bestMatch = fuzzyMatches.reduce((best, current) => 
          current.similarity > best.similarity ? current : best
        );
        
        return {
          surah: bestMatch.data.surah,
          ayah: bestMatch.data.ayah,
          surahName: this.getSurahName(bestMatch.data.surah),
          ayahText: bestMatch.data.text,
          confidence: bestMatch.similarity,
          matchType: 'fuzzy'
        };
      }

      // If no matches found, try searching the Quran API
      try {
        const searchResults = await this.searchQuran(transcript);
        if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
          const bestResult = searchResults[0];
          return {
            surah: bestResult.surah,
            ayah: bestResult.ayah,
            surahName: this.getSurahName(bestResult.surah),
            ayahText: bestResult.text || '',
            confidence: 0.7,
            matchType: 'search'
          };
        }
      } catch (searchError) {
        console.warn('Search API error in matchQuranText:', searchError);
        // Continue to return null if search fails
      }

      return null;
    } catch (error) {
      console.error('Error matching Quran text:', error);
      return null;
    }
  }

  // Calculate similarity between two strings
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  // Levenshtein distance algorithm
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Get surah name by number
  getSurahName(surahNumber) {
    const surahNames = {
      1: 'Al-Fatiha',
      2: 'Al-Baqarah',
      3: 'Aal-Imran',
      4: 'An-Nisa',
      5: 'Al-Ma\'idah',
      6: 'Al-An\'am',
      7: 'Al-A\'raf',
      8: 'Al-Anfal',
      9: 'At-Tawbah',
      10: 'Yunus',
      11: 'Hud',
      12: 'Yusuf',
      13: 'Ar-Ra\'d',
      14: 'Ibrahim',
      15: 'Al-Hijr',
      16: 'An-Nahl',
      17: 'Al-Isra',
      18: 'Al-Kahf',
      19: 'Maryam',
      20: 'Ta-Ha',
      21: 'Al-Anbiya',
      22: 'Al-Hajj',
      23: 'Al-Mu\'minun',
      24: 'An-Nur',
      25: 'Al-Furqan',
      26: 'Ash-Shu\'ara',
      27: 'An-Naml',
      28: 'Al-Qasas',
      29: 'Al-Ankabut',
      30: 'Ar-Rum',
      31: 'Luqman',
      32: 'As-Sajdah',
      33: 'Al-Ahzab',
      34: 'Saba',
      35: 'Fatir',
      36: 'Ya-Sin',
      37: 'As-Saffat',
      38: 'Sad',
      39: 'Az-Zumar',
      40: 'Ghafir',
      41: 'Fussilat',
      42: 'Ash-Shura',
      43: 'Az-Zukhruf',
      44: 'Ad-Dukhan',
      45: 'Al-Jathiyah',
      46: 'Al-Ahqaf',
      47: 'Muhammad',
      48: 'Al-Fath',
      49: 'Al-Hujurat',
      50: 'Qaf',
      51: 'Adh-Dhariyat',
      52: 'At-Tur',
      53: 'An-Najm',
      54: 'Al-Qamar',
      55: 'Ar-Rahman',
      56: 'Al-Waqi\'ah',
      57: 'Al-Hadid',
      58: 'Al-Mujadila',
      59: 'Al-Hashr',
      60: 'Al-Mumtahanah',
      61: 'As-Saf',
      62: 'Al-Jumu\'ah',
      63: 'Al-Munafiqun',
      64: 'At-Taghabun',
      65: 'At-Talaq',
      66: 'At-Tahrim',
      67: 'Al-Mulk',
      68: 'Al-Qalam',
      69: 'Al-Haqqah',
      70: 'Al-Ma\'arij',
      71: 'Nuh',
      72: 'Al-Jinn',
      73: 'Al-Muzzammil',
      74: 'Al-Muddathir',
      75: 'Al-Qiyamah',
      76: 'Al-Insan',
      77: 'Al-Mursalat',
      78: 'An-Naba',
      79: 'An-Nazi\'at',
      80: 'Abasa',
      81: 'At-Takwir',
      82: 'Al-Infitar',
      83: 'Al-Mutaffifin',
      84: 'Al-Inshiqaq',
      85: 'Al-Buruj',
      86: 'At-Tariq',
      87: 'Al-A\'la',
      88: 'Al-Ghashiyah',
      89: 'Al-Fajr',
      90: 'Al-Balad',
      91: 'Ash-Shams',
      92: 'Al-Layl',
      93: 'Ad-Duha',
      94: 'Ash-Sharh',
      95: 'At-Tin',
      96: 'Al-Alaq',
      97: 'Al-Qadr',
      98: 'Al-Bayyinah',
      99: 'Az-Zalzalah',
      100: 'Al-Adiyat',
      101: 'Al-Qari\'ah',
      102: 'At-Takathur',
      103: 'Al-Asr',
      104: 'Al-Humazah',
      105: 'Al-Fil',
      106: 'Quraysh',
      107: 'Al-Ma\'un',
      108: 'Al-Kawthar',
      109: 'Al-Kafirun',
      110: 'An-Nasr',
      111: 'Al-Masad',
      112: 'Al-Ikhlas',
      113: 'Al-Falaq',
      114: 'An-Nas'
    };
    
    return surahNames[surahNumber] || `Surah ${surahNumber}`;
  }

  // Real-time audio recitation with progress tracking
  async playAyahWithProgress(ayahNumber, edition = EDITIONS.audio) {
    try {
      const audioUrl = this.getAudioUrl(ayahNumber, edition);
      
      // This would integrate with a real audio player
      // For now, return the URL and metadata
      return {
        url: audioUrl,
        ayahNumber,
        edition,
        duration: 0, // Would be calculated from actual audio
        isPlaying: false,
        progress: 0
      };
    } catch (error) {
      console.error('Error playing ayah:', error);
      throw error;
    }
  }
}

export const quranApiService = new QuranApiService();
export default quranApiService;