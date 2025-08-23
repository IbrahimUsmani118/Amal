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

export interface Ayah {
  number: number;
  text: string;
  translation: string;
  audio?: string;
  surahNumber: number;
  ayahNumber: number;
}

export interface Surah {
  number: number;
  name: string;
  nameTranslated: string;
  nameEnglish: string;
  ayahs: Ayah[];
  totalAyahs: number;
  revelationType: string;
  revelationPlace: string;
}

export interface SearchResult {
  ayah: number;
  surah: number;
  text: string;
  edition: string;
}

export interface AudioRecitation {
  url: string;
  duration: number;
  format: string;
}

class QuranApiService {
  // Fetch a complete surah with Arabic text and English translation
  async fetchSurah(surahNumber: number): Promise<Surah> {
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

      const ayahs: Ayah[] = arabicData.data.ayahs.map((ayah: any, index: number) => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        translation: englishData.data.ayahs[index]?.text || '',
        audio: `${API_BASE}/ayah/${ayah.number}/${EDITIONS.audio}`,
        surahNumber: surahNumber,
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
  async fetchAyah(reference: string, edition: string = EDITIONS.arabic): Promise<Ayah> {
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
  async fetchAyahMultipleEditions(reference: string, editions: string[]): Promise<Ayah[]> {
    try {
      const editionsParam = editions.join(',');
      const response = await fetch(`${API_BASE}/ayah/${reference}/editions/${editionsParam}`);
      const data = await response.json();

      if (data.code !== 200) {
        throw new Error('Failed to fetch ayah editions');
      }

      return data.data.map((ayah: any) => ({
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
  async searchQuran(keyword: string, surahNumber?: number, edition?: string): Promise<SearchResult[]> {
    try {
      const surahParam = surahNumber ? surahNumber.toString() : 'all';
      const editionParam = edition || EDITIONS.english;
      
      const response = await fetch(`${API_BASE}/search/${keyword}/${surahParam}/${editionParam}`);
      const data = await response.json();

      if (data.code !== 200) {
        throw new Error('Search failed');
      }

      return data.data.map((result: any) => ({
        ayah: result.numberInSurah,
        surah: result.surah.number,
        text: result.text,
        edition: result.edition
      }));
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Get audio recitation URL
  getAudioUrl(ayahNumber: number, edition: string = EDITIONS.audio): string {
    return `${API_BASE}/ayah/${ayahNumber}/${edition}`;
  }

  // Get all surahs list
  async getAllSurahs(): Promise<Array<{ number: number; name: string; nameTranslated: string; nameEnglish: string }>> {
    try {
      const response = await fetch(`${API_BASE}/surah`);
      const data = await response.json();

      if (data.code !== 200) {
        throw new Error('Failed to fetch surahs list');
      }

      return data.data.map((surah: any) => ({
        number: surah.number,
        name: surah.name,
        nameTranslated: surah.englishName,
        nameEnglish: surah.englishNameTranslation
      }));
    } catch (error) {
      console.error('Error fetching surahs list:', error);
      throw error;
    }
  }

  // Voice command parser for future voice recognition integration
  parseVoiceCommand(command: string): { action: string; params: any } {
    const lowerCommand = command.toLowerCase().trim();
    
    // Parse surah selection commands
    if (lowerCommand.includes('surah') || lowerCommand.includes('chapter')) {
      const surahMatch = lowerCommand.match(/(\d+)/);
      if (surahMatch) {
        const surahNumber = parseInt(surahMatch[1]);
        if (surahNumber >= 1 && surahNumber <= 114) {
          return { action: 'selectSurah', params: { surahNumber } };
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
}

export const quranApiService = new QuranApiService();
export default quranApiService;
