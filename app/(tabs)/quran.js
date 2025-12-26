import UniversalHeader from '@/components/UniversalHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { QuranApiService } from '@/services/quranApi';
import { voiceRecognitionService } from '@/services/voiceRecognition';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// All 114 Surahs with their names
const SURAHS = [
    { number: 1, name: 'Al-Fatiha', arabicName: 'الفاتحة', ayahs: 7 },
    { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', ayahs: 286 },
    { number: 3, name: 'Aal-Imran', arabicName: 'آل عمران', ayahs: 200 },
    { number: 4, name: 'An-Nisa', arabicName: 'النساء', ayahs: 176 },
    { number: 5, name: 'Al-Ma\'idah', arabicName: 'المائدة', ayahs: 120 },
    { number: 6, name: 'Al-An\'am', arabicName: 'الأنعام', ayahs: 165 },
    { number: 7, name: 'Al-A\'raf', arabicName: 'الأعراف', ayahs: 206 },
    { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال', ayahs: 75 },
    { number: 9, name: 'At-Tawbah', arabicName: 'التوبة', ayahs: 129 },
    { number: 10, name: 'Yunus', arabicName: 'يونس', ayahs: 109 },
    { number: 11, name: 'Hud', arabicName: 'هود', ayahs: 123 },
    { number: 12, name: 'Yusuf', arabicName: 'يوسف', ayahs: 111 },
    { number: 13, name: 'Ar-Ra\'d', arabicName: 'الرعد', ayahs: 43 },
    { number: 14, name: 'Ibrahim', arabicName: 'إبراهيم', ayahs: 52 },
    { number: 15, name: 'Al-Hijr', arabicName: 'الحجر', ayahs: 99 },
    { number: 16, name: 'An-Nahl', arabicName: 'النحل', ayahs: 128 },
    { number: 17, name: 'Al-Isra', arabicName: 'الإسراء', ayahs: 111 },
    { number: 18, name: 'Al-Kahf', arabicName: 'الكهف', ayahs: 110 },
    { number: 19, name: 'Maryam', arabicName: 'مريم', ayahs: 98 },
    { number: 20, name: 'Ta-Ha', arabicName: 'طه', ayahs: 135 },
    { number: 21, name: 'Al-Anbiya', arabicName: 'الأنبياء', ayahs: 112 },
    { number: 22, name: 'Al-Hajj', arabicName: 'الحج', ayahs: 78 },
    { number: 23, name: 'Al-Mu\'minun', arabicName: 'المؤمنون', ayahs: 118 },
    { number: 24, name: 'An-Nur', arabicName: 'النور', ayahs: 64 },
    { number: 25, name: 'Al-Furqan', arabicName: 'الفرقان', ayahs: 77 },
    { number: 26, name: 'Ash-Shu\'ara', arabicName: 'الشعراء', ayahs: 227 },
    { number: 27, name: 'An-Naml', arabicName: 'النمل', ayahs: 93 },
    { number: 28, name: 'Al-Qasas', arabicName: 'القصص', ayahs: 88 },
    { number: 29, name: 'Al-Ankabut', arabicName: 'العنكبوت', ayahs: 69 },
    { number: 30, name: 'Ar-Rum', arabicName: 'الروم', ayahs: 60 },
    { number: 31, name: 'Luqman', arabicName: 'لقمان', ayahs: 34 },
    { number: 32, name: 'As-Sajdah', arabicName: 'السجدة', ayahs: 30 },
    { number: 33, name: 'Al-Ahzab', arabicName: 'الأحزاب', ayahs: 73 },
    { number: 34, name: 'Saba', arabicName: 'سبأ', ayahs: 54 },
    { number: 35, name: 'Fatir', arabicName: 'فاطر', ayahs: 45 },
    { number: 36, name: 'Ya-Sin', arabicName: 'يس', ayahs: 83 },
    { number: 37, name: 'As-Saffat', arabicName: 'الصافات', ayahs: 182 },
    { number: 38, name: 'Sad', arabicName: 'ص', ayahs: 88 },
    { number: 39, name: 'Az-Zumar', arabicName: 'الزمر', ayahs: 75 },
    { number: 40, name: 'Ghafir', arabicName: 'غافر', ayahs: 85 },
    { number: 41, name: 'Fussilat', arabicName: 'فصلت', ayahs: 54 },
    { number: 42, name: 'Ash-Shura', arabicName: 'الشورى', ayahs: 53 },
    { number: 43, name: 'Az-Zukhruf', arabicName: 'الزخرف', ayahs: 89 },
    { number: 44, name: 'Ad-Dukhan', arabicName: 'الدخان', ayahs: 59 },
    { number: 45, name: 'Al-Jathiyah', arabicName: 'الجاثية', ayahs: 37 },
    { number: 46, name: 'Al-Ahqaf', arabicName: 'الأحقاف', ayahs: 35 },
    { number: 47, name: 'Muhammad', arabicName: 'محمد', ayahs: 38 },
    { number: 48, name: 'Al-Fath', arabicName: 'الفتح', ayahs: 29 },
    { number: 49, name: 'Al-Hujurat', arabicName: 'الحجرات', ayahs: 18 },
    { number: 50, name: 'Qaf', arabicName: 'ق', ayahs: 45 },
    { number: 51, name: 'Adh-Dhariyat', arabicName: 'الذاريات', ayahs: 60 },
    { number: 52, name: 'At-Tur', arabicName: 'الطور', ayahs: 49 },
    { number: 53, name: 'An-Najm', arabicName: 'النجم', ayahs: 62 },
    { number: 54, name: 'Al-Qamar', arabicName: 'القمر', ayahs: 55 },
    { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', ayahs: 78 },
    { number: 56, name: 'Al-Waqi\'ah', arabicName: 'الواقعة', ayahs: 96 },
    { number: 57, name: 'Al-Hadid', arabicName: 'الحديد', ayahs: 29 },
    { number: 58, name: 'Al-Mujadila', arabicName: 'المجادلة', ayahs: 22 },
    { number: 59, name: 'Al-Hashr', arabicName: 'الحشر', ayahs: 24 },
    { number: 60, name: 'Al-Mumtahanah', arabicName: 'الممتحنة', ayahs: 13 },
    { number: 61, name: 'As-Saf', arabicName: 'الصف', ayahs: 14 },
    { number: 62, name: 'Al-Jumu\'ah', arabicName: 'الجمعة', ayahs: 11 },
    { number: 63, name: 'Al-Munafiqun', arabicName: 'المنافقون', ayahs: 11 },
    { number: 64, name: 'At-Taghabun', arabicName: 'التغابن', ayahs: 18 },
    { number: 65, name: 'At-Talaq', arabicName: 'الطلاق', ayahs: 12 },
    { number: 66, name: 'At-Tahrim', arabicName: 'التحريم', ayahs: 12 },
    { number: 67, name: 'Al-Mulk', arabicName: 'الملك', ayahs: 30 },
    { number: 68, name: 'Al-Qalam', arabicName: 'القلم', ayahs: 52 },
    { number: 69, name: 'Al-Haqqah', arabicName: 'الحاقة', ayahs: 52 },
    { number: 70, name: 'Al-Ma\'arij', arabicName: 'المعارج', ayahs: 44 },
    { number: 71, name: 'Nuh', arabicName: 'نوح', ayahs: 28 },
    { number: 72, name: 'Al-Jinn', arabicName: 'الجن', ayahs: 28 },
    { number: 73, name: 'Al-Muzzammil', arabicName: 'المزمل', ayahs: 20 },
    { number: 74, name: 'Al-Muddathir', arabicName: 'المدثر', ayahs: 56 },
    { number: 75, name: 'Al-Qiyamah', arabicName: 'القيامة', ayahs: 40 },
    { number: 76, name: 'Al-Insan', arabicName: 'الإنسان', ayahs: 31 },
    { number: 77, name: 'Al-Mursalat', arabicName: 'المرسلات', ayahs: 50 },
    { number: 78, name: 'An-Naba', arabicName: 'النبأ', ayahs: 40 },
    { number: 79, name: 'An-Nazi\'at', arabicName: 'النازعات', ayahs: 46 },
    { number: 80, name: 'Abasa', arabicName: 'عبس', ayahs: 42 },
    { number: 81, name: 'At-Takwir', arabicName: 'التكوير', ayahs: 29 },
    { number: 82, name: 'Al-Infitar', arabicName: 'الانفطار', ayahs: 19 },
    { number: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين', ayahs: 36 },
    { number: 84, name: 'Al-Inshiqaq', arabicName: 'الانشقاق', ayahs: 25 },
    { number: 85, name: 'Al-Buruj', arabicName: 'البروج', ayahs: 22 },
    { number: 86, name: 'At-Tariq', arabicName: 'الطارق', ayahs: 17 },
    { number: 87, name: 'Al-A\'la', arabicName: 'الأعلى', ayahs: 19 },
    { number: 88, name: 'Al-Ghashiyah', arabicName: 'الغاشية', ayahs: 26 },
    { number: 89, name: 'Al-Fajr', arabicName: 'الفجر', ayahs: 30 },
    { number: 90, name: 'Al-Balad', arabicName: 'البلد', ayahs: 20 },
    { number: 91, name: 'Ash-Shams', arabicName: 'الشمس', ayahs: 15 },
    { number: 92, name: 'Al-Layl', arabicName: 'الليل', ayahs: 21 },
    { number: 93, name: 'Ad-Duha', arabicName: 'الضحى', ayahs: 11 },
    { number: 94, name: 'Ash-Sharh', arabicName: 'الشرح', ayahs: 8 },
    { number: 95, name: 'At-Tin', arabicName: 'التين', ayahs: 8 },
    { number: 96, name: 'Al-Alaq', arabicName: 'العلق', ayahs: 19 },
    { number: 97, name: 'Al-Qadr', arabicName: 'القدر', ayahs: 5 },
    { number: 98, name: 'Al-Bayyinah', arabicName: 'البينة', ayahs: 8 },
    { number: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة', ayahs: 8 },
    { number: 100, name: 'Al-Adiyat', arabicName: 'العاديات', ayahs: 11 },
    { number: 101, name: 'Al-Qari\'ah', arabicName: 'القارعة', ayahs: 11 },
    { number: 102, name: 'At-Takathur', arabicName: 'التكاثر', ayahs: 8 },
    { number: 103, name: 'Al-Asr', arabicName: 'العصر', ayahs: 3 },
    { number: 104, name: 'Al-Humazah', arabicName: 'الهمزة', ayahs: 9 },
    { number: 105, name: 'Al-Fil', arabicName: 'الفيل', ayahs: 5 },
    { number: 106, name: 'Quraysh', arabicName: 'قريش', ayahs: 4 },
    { number: 107, name: 'Al-Ma\'un', arabicName: 'الماعون', ayahs: 7 },
    { number: 108, name: 'Al-Kawthar', arabicName: 'الكوثر', ayahs: 3 },
    { number: 109, name: 'Al-Kafirun', arabicName: 'الكافرون', ayahs: 6 },
    { number: 110, name: 'An-Nasr', arabicName: 'النصر', ayahs: 3 },
    { number: 111, name: 'Al-Masad', arabicName: 'المسد', ayahs: 5 },
    { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', ayahs: 4 },
    { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', ayahs: 5 },
    { number: 114, name: 'An-Nas', arabicName: 'الناس', ayahs: 6 },
];

// Create API instance outside component to avoid recreating on each render
const quranApi = new QuranApiService();

export default function QuranScreen() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [fullSurahData, setFullSurahData] = useState(null);
    const [loadingSurah, setLoadingSurah] = useState(false);
    const [showSurahModal, setShowSurahModal] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [targetAyah, setTargetAyah] = useState(null);
    const [voiceText, setVoiceText] = useState('');
    const flatListRef = useRef(null);
    const ayahScrollRef = useRef(null);
    
    const colors = theme === 'dark' 
        ? {
            background: '#0a0a0a',
            text: '#e8e8e8',
            textSecondary: '#b0b0b0',
            accent: '#ffd700',
            primary: '#1a1a2e',
            card: '#1a1a1a',
            border: '#333333',
        }
        : {
            background: '#f8f6f0',
            text: '#3d3d3d',
            textSecondary: '#6a6a6a',
            accent: '#ffd700',
            primary: '#ffffff',
            card: '#ffffff',
            border: '#e0e0e0',
        };

    // Fetch surahs from API on mount
    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                setLoading(true);
                const surahsData = await quranApi.getAllSurahs();
                setSurahs(surahsData);
            } catch (error) {
                console.error('Error fetching surahs:', error);
                // Fallback to hardcoded list if API fails
                setSurahs(SURAHS);
                Alert.alert('Connection Error', 'Using offline surah list. Some features may be limited.');
            } finally {
                setLoading(false);
            }
        };

        fetchSurahs();
    }, []);

    // Setup voice recognition callbacks
    useEffect(() => {
        if (showVoiceRecorder) {
            voiceRecognitionService.setOnResult((result) => {
                if (result.isFinal) {
                    const transcript = result.transcript;
                    setVoiceText(transcript);
                    handleVoiceTranscript(transcript);
                } else {
                    setVoiceText(result.transcript);
                }
            });

            voiceRecognitionService.setOnError((error) => {
                console.error('Voice recognition error:', error);
                setIsListening(false);
                setIsUploading(false);
                Alert.alert('Voice Error', error);
            });

            voiceRecognitionService.setOnEnd(() => {
                setIsListening(false);
                setIsUploading(false);
            });

            // Track upload progress
            voiceRecognitionService.setOnProgress((progress) => {
                setUploadProgress(progress);
                setIsUploading(true);
            });
        }

        return () => {
            voiceRecognitionService.setOnResult(null);
            voiceRecognitionService.setOnError(null);
            voiceRecognitionService.setOnEnd(null);
            voiceRecognitionService.setOnProgress(null);
        };
    }, [showVoiceRecorder]);

    const handleSurahPress = async (surah, targetAyahNumber = null) => {
        try {
            setSelectedSurah(surah);
            setLoadingSurah(true);
            setShowSurahModal(true);
            if (targetAyahNumber) {
                setTargetAyah(targetAyahNumber);
            }
            
            // Fetch full surah data
            const fullSurah = await quranApi.fetchSurah(surah.number);
            setFullSurahData(fullSurah);
            console.log('Selected surah:', fullSurah);
            
            // Scroll to target ayah if specified (after data is set)
            if (targetAyahNumber) {
                setTimeout(() => {
                    // Find the ayah index and scroll to it
                    const ayahIndex = fullSurah.ayahs.findIndex(a => a.number === targetAyahNumber);
                    if (ayahIndex >= 0 && ayahScrollRef.current) {
                        ayahScrollRef.current.scrollToIndex({ 
                            index: ayahIndex, 
                            animated: true,
                            viewPosition: 0.3
                        });
                    }
                }, 800); // Wait for FlatList to render
            }
        } catch (error) {
            console.error('Error fetching surah details:', error);
            Alert.alert('Error', 'Failed to load surah. Please try again.');
            setShowSurahModal(false);
        } finally {
            setLoadingSurah(false);
        }
    };

    const closeSurahModal = () => {
        setShowSurahModal(false);
        setFullSurahData(null);
        setSelectedSurah(null);
    };

    // Handle voice transcript and navigate to matching surah/ayah
    const handleVoiceTranscript = async (transcript) => {
        if (!transcript || transcript.trim().length === 0) return;
        
        setVoiceTranscript(transcript);
        console.log('🎤 Voice transcript received:', transcript);
        
        try {
            // First try to match Quran text
            const match = await quranApi.matchQuranText(transcript);
            
            if (match && match.surah) {
                console.log('✅ Found match:', match);
                
                // Find the surah in our list
                const surahList = surahs.length > 0 ? surahs : SURAHS;
                const foundSurah = surahList.find(s => s.number === match.surah);
                
                if (foundSurah) {
                    // Scroll to the surah in the list
                    const surahIndex = surahList.findIndex(s => s.number === match.surah);
                    if (flatListRef.current && surahIndex >= 0) {
                        flatListRef.current.scrollToIndex({ 
                            index: surahIndex, 
                            animated: true,
                            viewPosition: 0.5
                        });
                    }
                    
                    // Open the surah with target ayah
                    await handleSurahPress(foundSurah, match.ayah);
                    
                    Alert.alert(
                        'Voice Match Found!',
                        `Navigated to ${match.surahName}, Ayah ${match.ayah || '1'}`,
                        [{ text: 'OK' }]
                    );
                }
            } else {
                // Try parsing as a voice command
                const command = quranApi.parseVoiceCommand(transcript, surahs.length > 0 ? surahs : SURAHS);
                
                if (command.action === 'selectSurah' && command.params.surahNumber) {
                    const surahList = surahs.length > 0 ? surahs : SURAHS;
                    const foundSurah = surahList.find(s => s.number === command.params.surahNumber);
                    
                    if (foundSurah) {
                        const surahIndex = surahList.findIndex(s => s.number === command.params.surahNumber);
                        if (flatListRef.current && surahIndex >= 0) {
                            flatListRef.current.scrollToIndex({ 
                                index: surahIndex, 
                                animated: true,
                                viewPosition: 0.5
                            });
                        }
                        await handleSurahPress(foundSurah);
                        Alert.alert('Voice Command', `Opening Surah ${command.params.surahNumber}`);
                    }
                } else {
                    // Try searching the Quran for the transcript
                    try {
                        const searchResults = await quranApi.searchQuran(transcript);
                        if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
                            const firstMatch = searchResults[0];
                            const surahList = surahs.length > 0 ? surahs : SURAHS;
                            const foundSurah = surahList.find(s => s.number === firstMatch.surah);
                            
                            if (foundSurah) {
                                await handleSurahPress(foundSurah, firstMatch.ayah);
                                Alert.alert(
                                    'Search Result Found',
                                    `Found in ${foundSurah.nameEnglish || foundSurah.name}, Ayah ${firstMatch.ayah}`
                                );
                            } else {
                                Alert.alert(
                                    'No Match Found',
                                    `Could not find "${transcript}" in the Quran. Try reciting a verse or saying a surah name.`
                                );
                            }
                        } else {
                            Alert.alert(
                                'No Match Found',
                                `Could not find "${transcript}" in the Quran. Try reciting a verse or saying a surah name.`
                            );
                        }
                    } catch (searchError) {
                        console.warn('Search error in handleVoiceTranscript:', searchError);
                        Alert.alert(
                            'Search Unavailable',
                            `Could not search for "${transcript}". Try saying a surah name or number instead.`
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error processing voice transcript:', error);
            Alert.alert('Error', 'Failed to process voice input. Please try again.');
        }
    };

    const renderSurahItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.surahCard, { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: selectedSurah?.number === item.number ? 2 : 1,
            }]}
            onPress={() => handleSurahPress(item)}
            activeOpacity={0.6}
        >
            <View style={styles.surahNumberContainer}>
                <Text style={[styles.surahNumber, { color: colors.accent }]}>
                    {item.number}
                </Text>
            </View>
            <View style={styles.surahInfo} numberOfLines={1}>
                <Text 
                    style={[styles.surahName, { color: colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.nameEnglish || item.name}
                </Text>
                <Text 
                    style={[styles.surahArabic, { color: colors.textSecondary }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.arabicName || item.name}
                </Text>
                <Text style={[styles.surahAyahs, { color: colors.textSecondary }]}>
                    {item.numberOfAyahs || item.ayahs} Ayahs
                </Text>
            </View>
            <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={colors.textSecondary} 
                style={styles.chevron}
            />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Universal Header */}
            <UniversalHeader />
            
            <View style={styles.content}>
                {/* Page Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.headerTextContainer}>
                            <Text style={[styles.title, { color: colors.text }]}>
                                Quran
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                Select a Surah to read
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.voiceButton, { backgroundColor: colors.accent }]}
                            onPress={() => setShowVoiceRecorder(!showVoiceRecorder)}
                            activeOpacity={0.7}
                        >
                            <Ionicons 
                                name={showVoiceRecorder ? "mic" : "mic-outline"} 
                                size={24} 
                                color="#1a1a2e" 
                            />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Voice Recorder */}
                    {showVoiceRecorder && (
                        <View style={[styles.voiceRecorderContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.voiceControls}>
                                <TouchableOpacity
                                    style={[styles.voiceButtonLarge, { 
                                        backgroundColor: isListening ? '#ff6b6b' : colors.accent 
                                    }]}
                                    onPress={async () => {
                                        if (isListening) {
                                            await voiceRecognitionService.stopListening();
                                            setIsListening(false);
                                        } else {
                                            const started = await voiceRecognitionService.startListening('en-US');
                                            if (started) {
                                                setIsListening(true);
                                                setVoiceText('');
                                            }
                                        }
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons 
                                        name={isListening ? "stop" : "mic"} 
                                        size={32} 
                                        color="#1a1a2e" 
                                    />
                                </TouchableOpacity>
                                <Text style={[styles.voiceStatusText, { color: colors.textSecondary }]}>
                                    {isUploading 
                                        ? `Uploading... ${Math.round(uploadProgress)}%`
                                        : isListening 
                                            ? 'Listening... Speak a verse or surah name' 
                                            : 'Tap to start voice recognition'}
                                </Text>
                                {isUploading && (
                                    <View style={styles.progressBarContainer}>
                                        <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                                    </View>
                                )}
                            </View>
                            
                            {voiceText && (
                                <View style={[styles.transcriptContainer, { backgroundColor: colors.background }]}>
                                    <Text style={[styles.transcriptLabel, { color: colors.textSecondary }]}>
                                        Transcript:
                                    </Text>
                                    <Text style={[styles.transcriptText, { color: colors.text }]}>
                                        {voiceText}
                                    </Text>
                                </View>
                            )}
                            
                            {/* Manual text input as fallback */}
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    style={[styles.textInput, { 
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                        borderColor: colors.border
                                    }]}
                                    placeholder="Or type a surah name/number or verse..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={voiceText}
                                    onChangeText={setVoiceText}
                                    onSubmitEditing={() => {
                                        if (voiceText.trim()) {
                                            handleVoiceTranscript(voiceText.trim());
                                        }
                                    }}
                                />
                                <TouchableOpacity
                                    style={[styles.searchButton, { backgroundColor: colors.accent }]}
                                    onPress={() => {
                                        if (voiceText.trim()) {
                                            handleVoiceTranscript(voiceText.trim());
                                        }
                                    }}
                                >
                                    <Ionicons name="search" size={20} color="#1a1a2e" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Surahs List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                            Loading Surahs...
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={surahs.length > 0 ? surahs : SURAHS}
                        renderItem={renderSurahItem}
                        keyExtractor={(item) => item.number.toString()}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={true}
                        initialNumToRender={20}
                        maxToRenderPerBatch={10}
                        onScrollToIndexFailed={(info) => {
                            // Handle scroll to index failure
                            setTimeout(() => {
                                if (flatListRef.current) {
                                    flatListRef.current.scrollToIndex({ index: info.index, animated: true });
                                }
                            }, 100);
                        }}
                    />
                )}
            </View>

            {/* Surah Content Modal */}
            <Modal
                visible={showSurahModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={closeSurahModal}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
                    {/* Modal Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity
                            onPress={closeSurahModal}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <View style={styles.modalTitleContainer}>
                            {fullSurahData && (
                                <>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                                        {fullSurahData.nameEnglish || fullSurahData.nameTranslated}
                                    </Text>
                                    <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                                        {fullSurahData.name} • {fullSurahData.totalAyahs} Ayahs
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Surah Content */}
                    {loadingSurah ? (
                        <View style={styles.modalLoadingContainer}>
                            <ActivityIndicator size="large" color={colors.accent} />
                            <Text style={[styles.modalLoadingText, { color: colors.textSecondary }]}>
                                Loading Surah...
                            </Text>
                        </View>
                    ) : fullSurahData ? (
                        <FlatList
                            ref={ayahScrollRef}
                            data={fullSurahData.ayahs}
                            keyExtractor={(item) => item.number.toString()}
                            renderItem={({ item: ayah }) => (
                                <View
                                    style={[styles.ayahContainer, { borderBottomColor: colors.border }]}
                                >
                                    <View style={styles.ayahHeader}>
                                        <View style={[styles.ayahNumberBadge, { backgroundColor: colors.accent + '20' }]}>
                                            <Text style={[styles.ayahNumber, { color: colors.accent }]}>
                                                {ayah.number}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.ayahArabic, { color: colors.text }]}>
                                        {ayah.text}
                                    </Text>
                                    {ayah.translation && (
                                        <Text style={[styles.ayahTranslation, { color: colors.textSecondary }]}>
                                            {ayah.translation}
                                        </Text>
                                    )}
                                </View>
                            )}
                            contentContainerStyle={styles.modalContentContainer}
                            showsVerticalScrollIndicator={false}
                            onScrollToIndexFailed={(info) => {
                                setTimeout(() => {
                                    if (ayahScrollRef.current) {
                                        ayahScrollRef.current.scrollToIndex({ index: info.index, animated: true });
                                    }
                                }, 100);
                            }}
                        />
                    ) : null}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingBottom: 100, // Space for footer
    },
    header: {
        padding: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    voiceButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    voiceRecorderContainer: {
        marginTop: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    voiceControls: {
        alignItems: 'center',
        marginBottom: 16,
    },
    voiceButtonLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    voiceStatusText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    progressBarContainer: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#ffd700',
        borderRadius: 2,
    },
    transcriptContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    transcriptLabel: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '600',
    },
    transcriptText: {
        fontSize: 14,
        lineHeight: 20,
    },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    textInput: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
    },
    searchButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    surahCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    surahNumberContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    surahNumber: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    surahInfo: {
        flex: 1,
        marginRight: 12,
        minWidth: 0, // Allows text to wrap/ellipsize
    },
    surahName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    surahArabic: {
        fontSize: 16,
        marginBottom: 2,
        fontFamily: 'System',
    },
    surahAyahs: {
        fontSize: 14,
    },
    chevron: {
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        paddingTop: 60,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    closeButton: {
        marginRight: 16,
        padding: 4,
    },
    modalTitleContainer: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 16,
    },
    modalLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalLoadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    modalContent: {
        flex: 1,
    },
    modalContentContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    ayahContainer: {
        marginBottom: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
    },
    ayahHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ayahNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ayahNumber: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    ayahArabic: {
        fontSize: 24,
        lineHeight: 40,
        marginBottom: 12,
        textAlign: 'right',
        fontFamily: 'System',
        writingDirection: 'rtl',
    },
    ayahTranslation: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'left',
    },
});
