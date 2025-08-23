import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import quranApiService, { Surah, Ayah, SearchResult } from '@/services/quranApi';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/services/firebase';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Surah data for selector
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
      
      {/* Header */}
      <View style={[styles.header, styles[`${theme}Header`]]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, styles[`${theme}Title`]]}>أمال</Text>
          <Text style={[styles.subtitle, styles[`${theme}Subtitle`]]}>
            Enhanced Quran Reader
          </Text>
          {user && (
            <Text style={[styles.userEmail, { color: theme === 'light' ? '#6a6a6a' : '#b0b0b0' }]}>
              Welcome, {user.email}
            </Text>
          )}
        </View>
        {user && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme === 'light' ? '#3d3d3d' : '#ffd700'} />
            <Text style={[styles.logoutText, { color: theme === 'light' ? '#3d3d3d' : '#ffd700' }]}>Logout</Text>
          </TouchableOpacity>
        )}
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
              currentMode === 'listening' && styles[`${theme}ModeBtnTextActive`]
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 40,
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
    fontSize: 48,
    fontWeight: '600',
    marginBottom: 10,
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
    fontSize: 18,
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
    marginBottom: 40,
    gap: 20,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
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
    fontSize: 16,
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
    fontSize: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    minWidth: 200,
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
    fontSize: 16,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
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
    fontSize: 14,
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
    fontSize: 12,
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
    minHeight: 600,
  },
  book: {
    width: '100%',
    maxWidth: 900,
    height: '100%',
    borderRadius: 15,
    padding: 40,
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
    marginBottom: 50,
    paddingBottom: 30,
    borderBottomWidth: 2,
  },
  darkSurahHeader: {
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  lightSurahHeader: {
    borderBottomColor: 'rgba(60, 60, 60, 0.2)',
  },
  surahName: {
    fontSize: 40,
    fontFamily: Platform.OS === 'ios' ? 'Amiri' : 'serif',
    marginBottom: 10,
    textAlign: 'center',
  },
  darkSurahName: {
    color: '#ffd700',
  },
  lightSurahName: {
    color: '#3d3d3d',
  },
  surahNameTranslated: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
  },
  darkSurahNameTranslated: {
    color: '#e8e8e8',
  },
  lightSurahNameTranslated: {
    color: '#3d3d3d',
  },
  surahNameEnglish: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  darkSurahNameEnglish: {
    color: '#b0b0b0',
  },
  lightSurahNameEnglish: {
    color: '#6a6a6a',
  },
  surahInfo: {
    fontSize: 14,
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
    marginBottom: 40,
  },
  bismillah: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Amiri' : 'serif',
    textAlign: 'center',
    lineHeight: 36,
  },
  darkBismillah: {
    color: '#ffd700',
  },
  lightBismillah: {
    color: '#5a5a5a',
  },
  verseContainer: {
    marginBottom: 30,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  verseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  darkVerseNumber: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  lightVerseNumber: {
    backgroundColor: 'rgba(60, 60, 60, 0.1)',
  },
  verseNumberText: {
    fontSize: 16,
    fontWeight: '600',
  },
  darkVerseNumberText: {
    color: '#ffd700',
  },
  lightVerseNumberText: {
    color: '#5a5a5a',
  },
  verseArabic: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Amiri' : 'serif',
    textAlign: 'right',
    lineHeight: 40,
    marginBottom: 15,
  },
  darkVerseArabic: {
    color: '#e8e8e8',
  },
  lightVerseArabic: {
    color: '#3d3d3d',
  },
  verseTranslation: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    fontStyle: 'italic',
  },
  darkVerseTranslation: {
    color: '#b0b0b0',
  },
  lightVerseTranslation: {
    color: '#6a6a6a',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 5,
  },
});
