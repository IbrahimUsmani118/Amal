# Amal - Enhanced Quran Reader

A beautiful, modern Quran reader app built with React Native and Expo, designed to help Muslims better interact with their Salat and Quran reading. Now fully integrated with the Al-Quran Cloud API for real-time Quran data and voice recognition capabilities.

## 🌟 **New Features (v2.0)**

- **🔌 Real-Time API Integration** - Connected to Al-Quran Cloud API for live Quran data
- **🎯 Voice Recognition Ready** - Built-in voice command parsing for hands-free navigation
- **📚 Complete Surah Library** - All 114 surahs with Arabic text and English translations
- **🔍 Advanced Search** - Search across multiple editions and translations
- **🎧 Audio Integration** - Ready for Mishary Alafasy recitations
- **📱 No Bottom Navigation** - Clean, focused reading experience

## 🚀 **API Integration**

The app now uses the [Al-Quran Cloud API](http://api.alquran.cloud/) for:

- **Complete Quran Text** - Uthmani script with proper Arabic rendering
- **Multiple Translations** - Muhammad Asad, Pickthall, Yusuf Ali, and more
- **Audio Recitations** - Mishary Alafasy and other reciters
- **Advanced Search** - Keyword search across all surahs and editions
- **Voice Commands** - Natural language processing for navigation

### **API Endpoints Used:**

- `GET /surah/{number}/{edition}` - Fetch complete surahs
- `GET /ayah/{reference}/{edition}` - Fetch specific verses
- `GET /search/{keyword}/{surah}/{edition}` - Search functionality
- `GET /ayah/{reference}/editions/{editions}` - Multiple translations

## 🎤 **Voice Recognition System**

The app is designed to work with voice recognition systems that can:

- **Navigate Surahs**: "Go to Surah Al-Baqarah" or "Chapter 2"
- **Search Content**: "Search for Abraham" or "Find mercy"
- **Select Verses**: "Go to verse 2:255" (Ayat Al-Kursi)
- **Navigation**: "Next surah" or "Previous ayah"

### **Voice Command Examples:**

```
"Surah Al-Fatiha"     → Navigate to Surah 1
"Chapter 2"           → Navigate to Surah 2
"Search mercy"        → Search for "mercy" across all surahs
"Find Abraham"        → Search for "Abraham" in all translations
"Go to 2:255"        → Navigate to Ayat Al-Kursi
"Next"                → Go to next surah/ayah
"Previous"            → Go to previous surah/ayah
```

## 🏗️ **Architecture**

### **Service Layer (`services/quranApi.ts`)**
- Centralized API management
- Voice command parsing
- Error handling and retry logic
- Type-safe interfaces

### **Components**
- **QuranReaderScreen** - Main reading interface
- **Surah Selector** - Dropdown with all 114 surahs
- **Voice Controls** - Ready for voice recognition integration
- **Theme System** - Dark/light mode with Arabic typography

### **Data Flow**
```
Voice Input → Command Parser → API Service → UI Update
     ↓              ↓            ↓          ↓
Microphone → parseVoiceCommand → fetchSurah → Display
```

## 📱 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Internet connection (for API calls)

### **Installation**
```bash
git clone <repository-url>
cd Amal
npm install
npm start
```

### **Environment Setup**
The app automatically connects to the Al-Quran Cloud API. No API keys required!

## 🔧 **Development**

### **Adding New Voice Commands**
1. Update `parseVoiceCommand()` in `services/quranApi.ts`
2. Add new action handlers in the main component
3. Test with voice recognition system

### **Extending API Features**
1. Add new methods to `QuranApiService` class
2. Update TypeScript interfaces
3. Integrate with UI components

### **Voice Recognition Integration**
The app is designed to work with:
- **React Native Voice** - For mobile voice recognition
- **Web Speech API** - For web-based voice input
- **Custom Voice Services** - Azure, Google, or AWS

## 🌐 **API Editions Supported**

- **Arabic Text**: `quran-uthmani` (Uthmani script)
- **English Translations**: 
  - `en.asad` (Muhammad Asad)
  - `en.pickthall` (Marmaduke Pickthall)
  - `en.yusufali` (Abdullah Yusuf Ali)
- **Audio Recitations**: `ar.alafasy` (Mishary Alafasy)

## 📊 **Performance Features**

- **Lazy Loading** - Surahs loaded on demand
- **Caching** - API responses cached for offline reading
- **Error Handling** - Graceful fallbacks for network issues
- **Loading States** - Smooth user experience during API calls

## 🔮 **Future Enhancements**

- **Offline Mode** - Download surahs for offline reading
- **Bookmarks** - Save favorite verses and surahs
- **Reading Progress** - Track daily reading goals
- **Social Features** - Share verses and reading progress
- **Advanced Search** - Search by meaning, context, or theme
- **Audio Player** - Full audio recitation with controls

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test thoroughly with the API
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🙏 **Acknowledgments**

- **Al-Quran Cloud API** - For providing free Quran data
- **Expo Team** - For the amazing development platform
- **React Native Community** - For continuous improvements

---

**Amal v2.0** - Now with real-time Quran data and voice recognition capabilities! 🎉

*"Indeed, We have sent down to you the Book in truth for instructing mankind. He who receives guidance benefits his own soul, but he who strays injures his own soul."* - Quran 39:41
