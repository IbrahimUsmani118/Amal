import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { logout } from '@/services/firebase';
import quranApiService, { Surah } from '@/services/quranApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Surah data for selector - All 114 surahs
const SURAHS = [
  { number: 1, name: 'الفاتحة', nameTranslated: 'Al-Fatiha', nameEnglish: 'The Opening' },
  { number: 2, name: 'البقرة', nameTranslated: 'Al-Baqarah', nameEnglish: 'The Cow' },
  { number: 3, name: 'آل عمران', nameTranslated: 'Aal-Imran', nameEnglish: 'The Family of Imran' },
  { number: 4, name: 'النساء', nameTranslated: 'An-Nisa', nameEnglish: 'The Women' },
  { number: 5, name: 'المائدة', nameTranslated: 'Al-Ma\'idah', nameEnglish: 'The Table Spread' },
  { number: 6, name: 'الأنعام', nameTranslated: 'Al-An\'am', nameEnglish: 'The Cattle' },
  { number: 7, name: 'الأعراف', nameTranslated: 'Al-A\'raf', nameEnglish: 'The Heights' },
  { number: 8, name: 'الأنفال', nameTranslated: 'Al-Anfal', nameEnglish: 'The Spoils of War' },
  { number: 9, name: 'التوبة', nameTranslated: 'At-Tawbah', nameEnglish: 'The Repentance' },
  { number: 10, name: 'يونس', nameTranslated: 'Yunus', nameEnglish: 'Jonah' },
  { number: 11, name: 'هود', nameTranslated: 'Hud', nameEnglish: 'Hud' },
  { number: 12, name: 'يوسف', nameTranslated: 'Yusuf', nameEnglish: 'Joseph' },
  { number: 13, name: 'الرعد', nameTranslated: 'Ar-Ra\'d', nameEnglish: 'The Thunder' },
  { number: 14, name: 'إبراهيم', nameTranslated: 'Ibrahim', nameEnglish: 'Abraham' },
  { number: 15, name: 'الحجر', nameTranslated: 'Al-Hijr', nameEnglish: 'The Rocky Tract' },
  { number: 16, name: 'النحل', nameTranslated: 'An-Nahl', nameEnglish: 'The Bees' },
  { number: 17, name: 'الإسراء', nameTranslated: 'Al-Isra', nameEnglish: 'The Night Journey' },
  { number: 18, name: 'الكهف', nameTranslated: 'Al-Kahf', nameEnglish: 'The Cave' },
  { number: 19, name: 'مريم', nameTranslated: 'Maryam', nameEnglish: 'Mary' },
  { number: 20, name: 'طه', nameTranslated: 'Ta-Ha', nameEnglish: 'Ta-Ha' },
  { number: 21, name: 'الأنبياء', nameTranslated: 'Al-Anbiya', nameEnglish: 'The Prophets' },
  { number: 22, name: 'الحج', nameTranslated: 'Al-Hajj', nameEnglish: 'The Pilgrimage' },
  { number: 23, name: 'المؤمنون', nameTranslated: 'Al-Mu\'minun', nameEnglish: 'The Believers' },
  { number: 24, name: 'النور', nameTranslated: 'An-Nur', nameEnglish: 'The Light' },
  { number: 25, name: 'الفرقان', nameTranslated: 'Al-Furqan', nameEnglish: 'The Criterion' },
  { number: 26, name: 'الشعراء', nameTranslated: 'Ash-Shu\'ara', nameEnglish: 'The Poets' },
  { number: 27, name: 'النمل', nameTranslated: 'An-Naml', nameEnglish: 'The Ants' },
  { number: 28, name: 'القصص', nameTranslated: 'Al-Qasas', nameEnglish: 'The Stories' },
  { number: 29, name: 'العنكبوت', nameTranslated: 'Al-Ankabut', nameEnglish: 'The Spider' },
  { number: 30, name: 'الروم', nameTranslated: 'Ar-Rum', nameEnglish: 'The Romans' },
  { number: 31, name: 'لقمان', nameTranslated: 'Luqman', nameEnglish: 'Luqman' },
  { number: 32, name: 'السجدة', nameTranslated: 'As-Sajdah', nameEnglish: 'The Prostration' },
  { number: 33, name: 'الأحزاب', nameTranslated: 'Al-Ahzab', nameEnglish: 'The Combined Forces' },
  { number: 34, name: 'سبأ', nameTranslated: 'Saba', nameEnglish: 'Sheba' },
  { number: 35, name: 'فاطر', nameTranslated: 'Fatir', nameEnglish: 'Originator' },
  { number: 36, name: 'يس', nameTranslated: 'Ya-Sin', nameEnglish: 'Ya-Sin' },
  { number: 37, name: 'الصافات', nameTranslated: 'As-Saffat', nameEnglish: 'Those Who Set The Ranks' },
  { number: 38, name: 'ص', nameTranslated: 'Sad', nameEnglish: 'Sad' },
  { number: 39, name: 'الزمر', nameTranslated: 'Az-Zumar', nameEnglish: 'The Troops' },
  { number: 40, name: 'غافر', nameTranslated: 'Ghafir', nameEnglish: 'The Forgiver' },
  { number: 41, name: 'فصلت', nameTranslated: 'Fussilat', nameEnglish: 'Explained in Detail' },
  { number: 42, name: 'الشورى', nameTranslated: 'Ash-Shura', nameEnglish: 'The Consultation' },
  { number: 43, name: 'الزخرف', nameTranslated: 'Az-Zukhruf', nameEnglish: 'The Ornaments of Gold' },
  { number: 44, name: 'الدخان', nameTranslated: 'Ad-Dukhan', nameEnglish: 'The Smoke' },
  { number: 45, name: 'الجاثية', nameTranslated: 'Al-Jathiyah', nameEnglish: 'The Kneeling' },
  { number: 46, name: 'الأحقاف', nameTranslated: 'Al-Ahqaf', nameEnglish: 'The Wind-Curved Sandhills' },
  { number: 47, name: 'محمد', nameTranslated: 'Muhammad', nameEnglish: 'Muhammad' },
  { number: 48, name: 'الفتح', nameTranslated: 'Al-Fath', nameEnglish: 'The Victory' },
  { number: 49, name: 'الحجرات', nameTranslated: 'Al-Hujurat', nameEnglish: 'The Private Apartments' },
  { number: 50, name: 'ق', nameTranslated: 'Qaf', nameEnglish: 'Qaf' },
  { number: 51, name: 'الذاريات', nameTranslated: 'Adh-Dhariyat', nameEnglish: 'The Winnowing Winds' },
  { number: 52, name: 'الطور', nameTranslated: 'At-Tur', nameEnglish: 'The Mount' },
  { number: 53, name: 'النجم', nameTranslated: 'An-Najm', nameEnglish: 'The Star' },
  { number: 54, name: 'القمر', nameTranslated: 'Al-Qamar', nameEnglish: 'The Moon' },
  { number: 55, name: 'الرحمن', nameTranslated: 'Ar-Rahman', nameEnglish: 'The Beneficent' },
  { number: 56, name: 'الواقعة', nameTranslated: 'Al-Waqi\'ah', nameEnglish: 'The Inevitable' },
  { number: 57, name: 'الحديد', nameTranslated: 'Al-Hadid', nameEnglish: 'The Iron' },
  { number: 58, name: 'المجادلة', nameTranslated: 'Al-Mujadila', nameEnglish: 'The Pleading Woman' },
  { number: 59, name: 'الحشر', nameTranslated: 'Al-Hashr', nameEnglish: 'The Exile' },
  { number: 60, name: 'الممتحنة', nameTranslated: 'Al-Mumtahanah', nameEnglish: 'The Woman to be Examined' },
  { number: 61, name: 'الصف', nameTranslated: 'As-Saf', nameEnglish: 'The Ranks' },
  { number: 62, name: 'الجمعة', nameTranslated: 'Al-Jumu\'ah', nameEnglish: 'The Congregation' },
  { number: 63, name: 'المنافقون', nameTranslated: 'Al-Munafiqun', nameEnglish: 'The Hypocrites' },
  { number: 64, name: 'التغابن', nameTranslated: 'At-Taghabun', nameEnglish: 'The Mutual Disillusion' },
  { number: 65, name: 'الطلاق', nameTranslated: 'At-Talaq', nameEnglish: 'Divorce' },
  { number: 66, name: 'التحريم', nameTranslated: 'At-Tahrim', nameEnglish: 'The Prohibition' },
  { number: 67, name: 'الملك', nameTranslated: 'Al-Mulk', nameEnglish: 'The Sovereignty' },
  { number: 68, name: 'القلم', nameTranslated: 'Al-Qalam', nameEnglish: 'The Pen' },
  { number: 69, name: 'الحاقة', nameTranslated: 'Al-Haqqah', nameEnglish: 'The Reality' },
  { number: 70, name: 'المعارج', nameTranslated: 'Al-Ma\'arij', nameEnglish: 'The Ascending Stairways' },
  { number: 71, name: 'نوح', nameTranslated: 'Nuh', nameEnglish: 'Noah' },
  { number: 72, name: 'الجن', nameTranslated: 'Al-Jinn', nameEnglish: 'The Jinn' },
  { number: 73, name: 'المزمل', nameTranslated: 'Al-Muzzammil', nameEnglish: 'The Enshrouded One' },
  { number: 74, name: 'المدثر', nameTranslated: 'Al-Muddathir', nameEnglish: 'The Cloaked One' },
  { number: 75, name: 'القيامة', nameTranslated: 'Al-Qiyamah', nameEnglish: 'The Resurrection' },
  { number: 76, name: 'الإنسان', nameTranslated: 'Al-Insan', nameEnglish: 'Man' },
  { number: 77, name: 'المرسلات', nameTranslated: 'Al-Mursalat', nameEnglish: 'The Emissaries' },
  { number: 78, name: 'النبأ', nameTranslated: 'An-Naba', nameEnglish: 'The Tidings' },
  { number: 79, name: 'النازعات', nameTranslated: 'An-Nazi\'at', nameEnglish: 'Those Who Drag Forth' },
  { number: 80, name: 'عبس', nameTranslated: 'Abasa', nameEnglish: 'He Frowned' },
  { number: 81, name: 'التكوير', nameTranslated: 'At-Takwir', nameEnglish: 'The Overthrowing' },
  { number: 82, name: 'الإنفطار', nameTranslated: 'Al-Infitar', nameEnglish: 'The Cleaving' },
  { number: 83, name: 'المطففين', nameTranslated: 'Al-Mutaffifin', nameEnglish: 'The Defrauding' },
  { number: 84, name: 'الإنشقاق', nameTranslated: 'Al-Inshiqaq', nameEnglish: 'The Splitting Open' },
  { number: 85, name: 'البروج', nameTranslated: 'Al-Buruj', nameEnglish: 'The Mansions of the Stars' },
  { number: 86, name: 'الطارق', nameTranslated: 'At-Tariq', nameEnglish: 'The Morning Star' },
  { number: 87, name: 'الأعلى', nameTranslated: 'Al-A\'la', nameEnglish: 'The Most High' },
  { number: 88, name: 'الغاشية', nameTranslated: 'Al-Ghashiyah', nameEnglish: 'The Overwhelming' },
  { number: 89, name: 'الفجر', nameTranslated: 'Al-Fajr', nameEnglish: 'The Dawn' },
  { number: 90, name: 'البلد', nameTranslated: 'Al-Balad', nameEnglish: 'The City' },
  { number: 91, name: 'الشمس', nameTranslated: 'Ash-Shams', nameEnglish: 'The Sun' },
  { number: 92, name: 'الليل', nameTranslated: 'Al-Layl', nameEnglish: 'The Night' },
  { number: 93, name: 'الضحى', nameTranslated: 'Ad-Duha', nameEnglish: 'The Morning Hours' },
  { number: 94, name: 'الشرح', nameTranslated: 'Ash-Sharh', nameEnglish: 'The Relief' },
  { number: 95, name: 'التين', nameTranslated: 'At-Tin', nameEnglish: 'The Fig' },
  { number: 96, name: 'العلق', nameTranslated: 'Al-Alaq', nameEnglish: 'The Clot' },
  { number: 97, name: 'القدر', nameTranslated: 'Al-Qadr', nameEnglish: 'The Power' },
  { number: 98, name: 'البينة', nameTranslated: 'Al-Bayyinah', nameEnglish: 'The Clear Proof' },
  { number: 99, name: 'الزلزلة', nameTranslated: 'Az-Zalzalah', nameEnglish: 'The Earthquake' },
  { number: 100, name: 'العاديات', nameTranslated: 'Al-Adiyat', nameEnglish: 'The Coursers' },
  { number: 101, name: 'القارعة', nameTranslated: 'Al-Qari\'ah', nameEnglish: 'The Calamity' },
  { number: 102, name: 'التكاثر', nameTranslated: 'At-Takathur', nameEnglish: 'The Rivalry in World Increase' },
  { number: 103, name: 'العصر', nameTranslated: 'Al-Asr', nameEnglish: 'The Declining Day' },
  { number: 104, name: 'الهمزة', nameTranslated: 'Al-Humazah', nameEnglish: 'The Traducer' },
  { number: 105, name: 'الفيل', nameTranslated: 'Al-Fil', nameEnglish: 'The Elephant' },
  { number: 106, name: 'قريش', nameTranslated: 'Quraysh', nameEnglish: 'Quraysh' },
  { number: 107, name: 'الماعون', nameTranslated: 'Al-Ma\'un', nameEnglish: 'The Small Kindnesses' },
  { number: 108, name: 'الكوثر', nameTranslated: 'Al-Kawthar', nameEnglish: 'The Abundance' },
  { number: 109, name: 'الكافرون', nameTranslated: 'Al-Kafirun', nameEnglish: 'The Disbelievers' },
  { number: 110, name: 'النصر', nameTranslated: 'An-Nasr', nameEnglish: 'The Divine Support' },
  { number: 111, name: 'المسد', nameTranslated: 'Al-Masad', nameEnglish: 'The Palm Fiber' },
  { number: 112, name: 'الإخلاص', nameTranslated: 'Al-Ikhlas', nameEnglish: 'The Sincerity' },
  { number: 113, name: 'الفلق', nameTranslated: 'Al-Falaq', nameEnglish: 'The Daybreak' },
  { number: 114, name: 'الناس', nameTranslated: 'An-Nas', nameEnglish: 'Mankind' }
];

export default function QuranReaderScreen() {
  const colorScheme = useColorScheme();
  const { user, loading: authLoading } = useAuth();
  const [isLightMode, setIsLightMode] = useState(false);
  const [currentMode, setCurrentMode] = useState('reading');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSurahSelector, setShowSurahSelector] = useState(false);
  const [showListeningModal, setShowListeningModal] = useState(false);
  const [currentRecitation, setCurrentRecitation] = useState<{
    surah: number;
    ayah: number;
    surahName: string;
    ayahText: string;
  } | null>(null);

  const theme = isLightMode ? 'light' : 'dark';

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login' as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login' as any);
    }
  }, [user, authLoading]);

  // Fetch surah data from API
  const fetchSurah = async (surahNumber: number) => {
    setLoading(true);
    try {
      const surah = await quranApiService.fetchSurah(surahNumber);
      setCurrentSurah(surah);
      setSelectedSurah(surahNumber);
    } catch (error) {
      console.error('Error fetching surah:', error);
      Alert.alert('Error', 'Failed to load surah. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Search functionality for voice recognition
  const searchQuran = async (keyword: string, surahNumber?: number) => {
    try {
      const results = await quranApiService.searchQuran(keyword, surahNumber);
      console.log('Search results:', results);
      // You can implement UI to show search results
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Voice recognition handler (placeholder for future implementation)
  const handleVoiceCommand = (command: string) => {
    const parsed = quranApiService.parseVoiceCommand(command);
    
    switch (parsed.action) {
      case 'selectSurah':
        fetchSurah(parsed.params.surahNumber);
        break;
      case 'search':
        searchQuran(parsed.params.keyword);
        break;
      case 'selectAyah':
        // TODO: Implement ayah selection
        console.log('Select ayah:', parsed.params);
        break;
      case 'next':
        // TODO: Implement next surah/ayah
        console.log('Next');
        break;
      case 'previous':
        // TODO: Implement previous surah/ayah
        console.log('Previous');
        break;
      default:
        console.log('Unknown command:', command);
    }
  };

  // Simulate recitation detection (replace with actual voice recognition)
  const startListening = () => {
    setIsVoiceActive(true);
    setShowListeningModal(true);
    
    // Simulate detecting recitation after 2 seconds
    setTimeout(() => {
      setCurrentRecitation({
        surah: 1,
        ayah: 1,
        surahName: 'Al-Fatiha',
        ayahText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
      });
    }, 2000);
  };

  const stopListening = () => {
    setIsVoiceActive(false);
    setShowListeningModal(false);
    setCurrentRecitation(null);
  };

  useEffect(() => {
    fetchSurah(1); // Load Al-Fatiha by default
  }, []);

  const toggleTheme = () => setIsLightMode(!isLightMode);
  const toggleMode = (mode: string) => setCurrentMode(mode);
  const toggleVoice = () => {
    if (isVoiceActive) {
      stopListening();
    } else {
      startListening();
    }
  };
  const toggleSurahSelector = () => setShowSurahSelector(!showSurahSelector);

  const getIconColor = () => theme === 'light' ? '#3d3d3d' : '#e8e8e8';

  if (authLoading) {
    return (
      <View style={[styles.container, styles[theme], styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme === 'light' ? '#5a5a5a' : '#ffd700'} />
        <Text style={[styles.loadingText, styles[`${theme}LoadingText`]]}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (loading && !currentSurah) {
    return (
      <View style={[styles.container, styles[theme], styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme === 'light' ? '#5a5a5a' : '#ffd700'} />
        <Text style={[styles.loadingText, styles[`${theme}LoadingText`]]}>
          Loading Quran...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles[theme]]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
      
      {/* Compact Header */}
      <View style={[styles.header, styles[`${theme}Header`]]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, styles[`${theme}Title`]]}>أمال</Text>
          <Text style={[styles.subtitle, styles[`${theme}Subtitle`]]}>
            Enhanced Quran Reader
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme === 'light' ? '#3d3d3d' : '#ffd700'} />
        </TouchableOpacity>
      </View>

      {/* Theme Toggle */}
      <TouchableOpacity style={[styles.themeToggle, styles[`${theme}ThemeToggle`]]} onPress={toggleTheme}>
        <Ionicons 
          name={theme === 'light' ? 'moon' : 'sunny'} 
          size={24} 
          color={theme === 'light' ? '#3d3d3d' : '#ffd700'} 
        />
      </TouchableOpacity>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Mode Toggle */}
        <View style={[styles.modeToggle, styles[`${theme}ModeToggle`]]}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              currentMode === 'reading' && styles[`${theme}ModeBtnActive`]
            ]}
            onPress={() => toggleMode('reading')}
          >
            <Text style={[
              styles.modeBtnText,
              currentMode === 'reading' && styles[`${theme}ModeBtnTextActive`]
            ]}>
              Reading
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              currentMode === 'listening' && styles[`${theme}ModeBtnActive`]
            ]}
            onPress={() => toggleMode('listening')}
          >
            <Text style={[
              styles.modeBtnText,
              currentMode === 'reading' && styles[`${theme}ModeBtnTextActive`]
            ]}>
              Listening
            </Text>
          </TouchableOpacity>
        </View>

        {/* Surah Selector */}
        <View style={styles.surahSelector}>
          <Text style={[styles.surahLabel, styles[`${theme}SurahLabel`]]}>
            Surah:
          </Text>
          <TouchableOpacity 
            style={[styles.selectWrapper, styles[`${theme}SelectWrapper`]]}
            onPress={toggleSurahSelector}
          >
            <Text style={[styles.selectText, styles[`${theme}SelectText`]]}>
              {currentSurah ? `${currentSurah.number}. ${currentSurah.nameTranslated}` : 'Loading...'}
            </Text>
            <Ionicons 
              name={showSurahSelector ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={getIconColor()} 
            />
          </TouchableOpacity>
        </View>

        {/* Voice Controls */}
        <View style={[styles.voiceControls, styles[`${theme}VoiceControls`]]}>
          <TouchableOpacity
            style={[
              styles.voiceToggle,
              isVoiceActive && styles.voiceToggleActive
            ]}
            onPress={toggleVoice}
          >
            <Ionicons 
              name={isVoiceActive ? 'mic' : 'mic-outline'} 
              size={18} 
              color={isVoiceActive ? 'white' : getIconColor()} 
            />
            <Text style={[
              styles.voiceToggleText,
              isVoiceActive && styles.voiceToggleTextActive
            ]}>
              {isVoiceActive ? 'Listening' : 'Voice'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.voiceStatus, isVoiceActive && styles.voiceStatusListening]}>
            {isVoiceActive ? 'Listening...' : 'Tap to activate'}
          </Text>
        </View>
      </View>

      {/* Surah Dropdown Modal */}
      <Modal
        visible={showSurahSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSurahSelector(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowSurahSelector(false)}
        >
          <View style={[styles.surahDropdown, styles[`${theme}SurahDropdown`]]}>
            <ScrollView style={styles.surahList} showsVerticalScrollIndicator={false}>
              {SURAHS.map((surah) => (
                <TouchableOpacity
                  key={surah.number}
                  style={[
                    styles.surahItem,
                    selectedSurah === surah.number && styles[`${theme}SurahItemActive`]
                  ]}
                  onPress={() => {
                    fetchSurah(surah.number);
                    setShowSurahSelector(false);
                  }}
                >
                  <Text style={[styles.surahItemNumber, styles[`${theme}SurahItemNumber`]]}>
                    {surah.number}
                  </Text>
                  <View style={styles.surahItemText}>
                    <Text style={[styles.surahItemName, styles[`${theme}SurahItemName`]]}>
                      {surah.name}
                    </Text>
                    <Text style={[styles.surahItemTranslated, styles[`${theme}SurahItemTranslated`]]}>
                      {surah.nameTranslated}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Listening Mode Modal */}
      <Modal
        visible={showListeningModal}
        transparent={true}
        animationType="slide"
        onRequestClose={stopListening}
      >
        <View style={[styles.listeningModal, styles[`${theme}ListeningModal`]]}>
          <View style={styles.listeningHeader}>
            <Text style={[styles.listeningTitle, styles[`${theme}ListeningTitle`]]}>
              🎧 Listening Mode
            </Text>
            <TouchableOpacity onPress={stopListening} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={getIconColor()} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.listeningContent}>
            {currentRecitation ? (
              <View style={styles.recitationInfo}>
                <Text style={[styles.recitationLabel, styles[`${theme}RecitationLabel`]]}>
                  Currently Reciting:
                </Text>
                <Text style={[styles.recitationSurah, styles[`${theme}RecitationSurah`]]}>
                  Surah {currentRecitation.surahName} ({currentRecitation.surah})
                </Text>
                <Text style={[styles.recitationAyah, styles[`${theme}RecitationAyah`]]}>
                  Ayah {currentRecitation.ayah}
                </Text>
                <Text style={[styles.recitationText, styles[`${theme}RecitationText`]]}>
                  {currentRecitation.ayahText}
                </Text>
                
                <TouchableOpacity 
                  style={[styles.followButton, styles[`${theme}FollowButton`]]}
                  onPress={() => {
                    fetchSurah(currentRecitation.surah);
                    setShowListeningModal(false);
                  }}
                >
                  <Text style={styles.followButtonText}>Follow Along</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.listeningWaiting}>
                <ActivityIndicator size="large" color={theme === 'light' ? '#5a5a5a' : '#ffd700'} />
                <Text style={[styles.listeningWaitingText, styles[`${theme}ListeningWaitingText`]]}>
                  Listening for recitation...
                </Text>
                <Text style={[styles.listeningHint, styles[`${theme}ListeningHint`]]}>
                  Speak clearly or play Quran audio nearby
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Book Container */}
      <View style={styles.bookContainer}>
        <View style={[styles.book, styles[`${theme}Book`]]}>
          <ScrollView 
            style={styles.page} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pageContent}
          >
            {currentSurah && (
              <>
                {/* Surah Header */}
                <View style={[styles.surahHeader, styles[`${theme}SurahHeader`]]}>
                  <Text style={[styles.surahName, styles[`${theme}SurahName`]]}>
                    {currentSurah.name}
                  </Text>
                  <Text style={[styles.surahNameTranslated, styles[`${theme}SurahNameTranslated`]]}>
                    {currentSurah.nameTranslated}
                  </Text>
                  <Text style={[styles.surahNameEnglish, styles[`${theme}SurahNameEnglish`]]}>
                    {currentSurah.nameEnglish}
                  </Text>
                  <Text style={[styles.surahInfo, styles[`${theme}SurahInfo`]]}>
                    {currentSurah.totalAyahs} Verses
                  </Text>
                </View>

                {/* Bismillah */}
                <View style={styles.bismillahContainer}>
                  <Text style={[styles.bismillah, styles[`${theme}Bismillah`]]}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </Text>
                </View>

                {/* Verses */}
                {currentSurah.ayahs.map((ayah) => (
                  <View key={ayah.number} style={styles.verseContainer}>
                    <View style={styles.verseHeader}>
                      <View style={[styles.verseNumber, styles[`${theme}VerseNumber`]]}>
                        <Text style={[styles.verseNumberText, styles[`${theme}VerseNumberText`]]}>
                          {ayah.number}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.verseArabic, styles[`${theme}VerseArabic`]]}>
                      {ayah.text}
                    </Text>
                    <Text style={[styles.verseTranslation, styles[`${theme}VerseTranslation`]]}>
                      {ayah.translation}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  dark: {
    backgroundColor: '#0a0a0a',
  },
  light: {
    backgroundColor: '#f8f6f0',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
  },
  darkLoadingText: {
    color: '#e8e8e8',
  },
  lightLoadingText: {
    color: '#3d3d3d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  headerLeft: {
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    gap: 5,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
  },
  darkHeader: {
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightHeader: {
    borderBottomColor: 'rgba(60, 60, 60, 0.15)',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 5,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Amiri' : 'serif',
  },
  darkTitle: {
    color: '#ffd700',
  },
  lightTitle: {
    color: '#3d3d3d',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '300',
  },
  darkSubtitle: {
    color: '#b0b0b0',
  },
  lightSubtitle: {
    color: '#6a6a6a',
  },
  themeToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 12,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkThemeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightThemeToggle: {
    backgroundColor: 'rgba(60, 60, 60, 0.1)',
  },
  controls: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    padding: 4,
  },
  darkModeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightModeToggle: {
    backgroundColor: 'rgba(60, 60, 60, 0.1)',
  },
  modeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 26,
    backgroundColor: 'transparent',
  },
  modeBtnActive: {
    backgroundColor: '#d4af37',
  },
  darkModeBtnActive: {
    backgroundColor: '#d4af37',
  },
  lightModeBtnActive: {
    backgroundColor: '#5a5a5a',
  },
  modeBtnText: {
    fontWeight: '500',
    fontSize: 14,
  },
  darkModeBtnText: {
    color: '#e8e8e8',
  },
  lightModeBtnText: {
    color: '#3d3d3d',
  },
  modeBtnTextActive: {
    color: '#1a1a2e',
  },
  darkModeBtnTextActive: {
    color: '#1a1a2e',
  },
  lightModeBtnTextActive: {
    color: '#f8f6f0',
  },
  surahSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  surahLabel: {
    fontWeight: '500',
    fontSize: 14,
  },
  darkSurahLabel: {
    color: '#ffd700',
  },
  lightSurahLabel: {
    color: '#5a5a5a',
  },
  selectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1,
    minWidth: 180,
  },
  darkSelectWrapper: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightSelectWrapper: {
    borderColor: 'rgba(60, 60, 60, 0.2)',
    backgroundColor: 'rgba(248, 246, 240, 0.9)',
  },
  selectText: {
    fontSize: 14,
    flex: 1,
  },
  darkSelectText: {
    color: '#e8e8e8',
  },
  lightSelectText: {
    color: '#3d3d3d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahDropdown: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    padding: 20,
  },
  darkSurahDropdown: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  lightSurahDropdown: {
    backgroundColor: '#fefdfb',
    borderColor: 'rgba(60, 60, 60, 0.1)',
    borderWidth: 1,
  },
  surahList: {
    padding: 10,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
  darkSurahItemActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  lightSurahItemActive: {
    backgroundColor: 'rgba(60, 60, 60, 0.1)',
  },
  surahItemNumber: {
    width: 30,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  darkSurahItemNumber: {
    color: '#ffd700',
  },
  lightSurahItemNumber: {
    color: '#5a5a5a',
  },
  surahItemText: {
    flex: 1,
    marginLeft: 15,
  },
  surahItemName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Amiri' : 'serif',
  },
  darkSurahItemName: {
    color: '#e8e8e8',
  },
  lightSurahItemName: {
    color: '#3d3d3d',
  },
  surahItemTranslated: {
    fontSize: 12,
    marginTop: 2,
  },
  darkSurahItemTranslated: {
    color: '#b0b0b0',
  },
  lightSurahItemTranslated: {
    color: '#6a6a6a',
  },
  voiceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    padding: 8,
  },
  darkVoiceControls: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightVoiceControls: {
    backgroundColor: 'rgba(60, 60, 60, 0.1)',
  },
  voiceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  voiceToggleActive: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  voiceToggleText: {
    fontWeight: '500',
    fontSize: 12,
  },
  darkVoiceToggleText: {
    color: '#e8e8e8',
  },
  lightVoiceToggleText: {
    color: '#3d3d3d',
  },
  voiceToggleTextActive: {
    color: 'white',
  },
  voiceStatus: {
    fontSize: 11,
    fontWeight: '500',
  },
  darkVoiceStatus: {
    color: '#b0b0b0',
  },
  lightVoiceStatus: {
    color: '#6a6a6a',
  },
  voiceStatusListening: {
    color: '#27ae60',
  },
  listeningModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  darkListeningModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  lightListeningModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  listeningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: 30,
  },
  listeningTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  darkListeningTitle: {
    color: '#ffd700',
  },
  lightListeningTitle: {
    color: '#ffffff',
  },
  closeButton: {
    padding: 10,
  },
  listeningContent: {
    width: '90%',
    alignItems: 'center',
  },
  listeningWaiting: {
    alignItems: 'center',
    padding: 40,
  },
  listeningWaitingText: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  darkListeningWaitingText: {
    color: '#ffffff',
  },
  lightListeningWaitingText: {
    color: '#ffffff',
  },
  listeningHint: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  darkListeningHint: {
    color: '#ffffff',
  },
  lightListeningHint: {
    color: '#ffffff',
  },
  recitationInfo: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: '100%',
  },
  recitationLabel: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: '500',
  },
  darkRecitationLabel: {
    color: '#ffffff',
  },
  lightRecitationLabel: {
    color: '#ffffff',
  },
  recitationSurah: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  darkRecitationSurah: {
    color: '#ffd700',
  },
  lightRecitationSurah: {
    color: '#ffd700',
  },
  recitationAyah: {
    fontSize: 18,
    marginBottom: 20,
  },
  darkRecitationAyah: {
    color: '#ffffff',
  },
  lightRecitationAyah: {
    color: '#ffffff',
  },
  recitationText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    fontFamily: Platform.OS === 'ios' ? 'Amiri' : 'serif',
  },
  darkRecitationText: {
    color: '#ffffff',
  },
  lightRecitationText: {
    color: '#ffffff',
  },
  followButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: '#27ae60',
  },
  darkFollowButton: {
    backgroundColor: '#27ae60',
  },
  lightFollowButton: {
    backgroundColor: '#27ae60',
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bookContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 500,
  },
  book: {
    width: '100%',
    maxWidth: 900,
    height: '100%',
    borderRadius: 15,
    padding: 30,
    borderWidth: 1,
  },
  darkBook: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightBook: {
    backgroundColor: '#fefdfb',
    borderColor: 'rgba(60, 60, 60, 0.1)',
  },
  page: {
    flex: 1,
  },
  pageContent: {
    paddingBottom: 100, // Add extra padding for better scrolling
  },
  surahHeader: {
    alignItems: 'center',
    marginBottom: 40,
    paddingBottom: 25,
    borderBottomWidth: 2,
  },
  darkSurahHeader: {
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  lightSurahHeader: {
    borderBottomColor: 'rgba(60, 60, 60, 0.2)',
  },
  surahName: {
    fontSize: 36,
    fontFamily: Platform.OS === 'ios' ? 'Amiri' : 'serif',
    marginBottom: 8,
    textAlign: 'center',
  },
  darkSurahName: {
    color: '#ffd700',
  },
  lightSurahName: {
    color: '#3d3d3d',
  },
  surahNameTranslated: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  darkSurahNameTranslated: {
    color: '#e8e8e8',
  },
  lightSurahNameTranslated: {
    color: '#3d3d3d',
  },
  surahNameEnglish: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  darkSurahNameEnglish: {
    color: '#b0b0b0',
  },
  lightSurahNameEnglish: {
    color: '#6a6a6a',
  },
  surahInfo: {
    fontSize: 12,
    fontWeight: '500',
  },
  darkSurahInfo: {
    color: '#ffd700',
  },
  lightSurahInfo: {
    color: '#5a5a5a',
  },
  bismillahContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  bismillah: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Amiri' : 'serif',
    textAlign: 'center',
    lineHeight: 32,
  },
  darkBismillah: {
    color: '#ffd700',
  },
  lightBismillah: {
    color: '#5a5a5a',
  },
  verseContainer: {
    marginBottom: 25,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  verseNumber: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  darkVerseNumber: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  lightVerseNumber: {
    backgroundColor: 'rgba(60, 60, 60, 0.1)',
  },
  verseNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  darkVerseNumberText: {
    color: '#ffd700',
  },
  lightVerseNumberText: {
    color: '#5a5a5a',
  },
  verseArabic: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Amiri' : 'serif',
    textAlign: 'right',
    lineHeight: 36,
    marginBottom: 12,
  },
  darkVerseArabic: {
    color: '#e8e8e8',
  },
  lightVerseArabic: {
    color: '#3d3d3d',
  },
  verseTranslation: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'left',
    fontStyle: 'italic',
  },
  darkVerseTranslation: {
    color: '#b0b0b0',
  },
  lightVerseTranslation: {
    color: '#6a6a6a',
  },
});
