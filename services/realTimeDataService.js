// Real-Time Data Service
// Manages all dynamic data updates including prayer times, qibla, location, and voice recognition
import { prayerTimeApi } from './prayerTimeApi';
import { qiblaApi } from './qiblaApi';
import { quranApiService } from './quranApi';
import { voiceRecognitionService } from './voiceRecognition';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

class RealTimeDataService {
    constructor() {
        this.updateIntervals = new Map();
        this.listeners = new Map();
        this.currentLocation = null;
        this.prayerTimes = [];
        this.qiblaDirection = null;
        this.isLocationTracking = false;
        this.isPrayerTimeTracking = false;
        this.isQiblaTracking = false;
        
        // Real-time update intervals (in milliseconds)
        this.UPDATE_INTERVALS = {
            PRAYER_TIMES: 60000, // 1 minute
            QIBLA: 5000, // 5 seconds for smooth compass movement
            LOCATION: 30000, // 30 seconds
            // VOICE_RECOGNITION removed - polling conflicts with recorder initialization
        };
        
        this.initializeService();
    }

    // Initialize the real-time data service
    initializeService() {
        console.log('🚀 Initializing Real-Time Data Service');
        this.setupLocationTracking();
        this.setupPrayerTimeTracking();
        this.setupQiblaTracking();
    }

    // ==================== LOCATION TRACKING ====================
    
    async setupLocationTracking() {
        try {
            // Request location permissions
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
                if (newStatus !== 'granted') {
                    console.log('Location permission denied');
                    return;
                }
            }

            // Start location tracking
            this.startLocationTracking();
        } catch (error) {
            console.error('Error setting up location tracking:', error);
        }
    }

    startLocationTracking() {
        if (this.isLocationTracking) return;

        this.isLocationTracking = true;
        console.log('📍 Starting location tracking');

        // Get initial location
        this.updateCurrentLocation();

        // Set up periodic location updates
        const locationInterval = setInterval(() => {
            this.updateCurrentLocation();
        }, this.UPDATE_INTERVALS.LOCATION);

        this.updateIntervals.set('location', locationInterval);
    }

    async updateCurrentLocation() {
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 10000,
                distanceInterval: 100,
            });

            const previousLocation = this.currentLocation;
            this.currentLocation = location;

            // Notify listeners if location changed significantly
            if (this.hasLocationChanged(previousLocation, location)) {
                this.notifyListeners('location', {
                    location: this.currentLocation,
                    previousLocation,
                    timestamp: Date.now(),
                });

                // Update dependent services
                this.updatePrayerTimes();
                this.updateQiblaDirection();
            }
        } catch (error) {
            console.error('Error updating location:', error);
            this.notifyListeners('locationError', { error: error.message });
        }
    }

    hasLocationChanged(previous, current) {
        if (!previous || !current) return true;
        
        const threshold = 0.001; // ~100 meters
        const latDiff = Math.abs(previous.coords.latitude - current.coords.latitude);
        const lngDiff = Math.abs(previous.coords.longitude - current.coords.longitude);
        
        return latDiff > threshold || lngDiff > threshold;
    }

    // ==================== PRAYER TIME TRACKING ====================
    
    setupPrayerTimeTracking() {
        this.startPrayerTimeTracking();
    }

    startPrayerTimeTracking() {
        if (this.isPrayerTimeTracking) return;

        this.isPrayerTimeTracking = true;
        console.log('🕌 Starting prayer time tracking');

        // Get initial prayer times
        this.updatePrayerTimes();

        // Set up periodic prayer time updates
        const prayerInterval = setInterval(() => {
            this.updatePrayerTimes();
        }, this.UPDATE_INTERVALS.PRAYER_TIMES);

        this.updateIntervals.set('prayerTimes', prayerInterval);
    }

    async updatePrayerTimes() {
        if (!this.currentLocation) {
            console.log('No location available for prayer times');
            return;
        }

        try {
            const response = await prayerTimeApi.getPrayerTimesByCoordinates(
                this.currentLocation.coords.latitude,
                this.currentLocation.coords.longitude
            );

            if (response.success) {
                const previousPrayerTimes = this.prayerTimes;
                this.prayerTimes = response.result.times;

                // Notify listeners
                this.notifyListeners('prayerTimes', {
                    prayerTimes: this.prayerTimes,
                    previousPrayerTimes,
                    nextPrayer: prayerTimeApi.getNextPrayer(this.prayerTimes),
                    timeUntilNext: prayerTimeApi.getTimeUntilNextPrayer(this.prayerTimes),
                    timestamp: Date.now(),
                });

                console.log('✅ Prayer times updated');
            }
        } catch (error) {
            console.error('Error updating prayer times:', error);
            this.notifyListeners('prayerTimesError', { error: error.message });
        }
    }

    // ==================== QIBLA TRACKING ====================
    
    setupQiblaTracking() {
        this.startQiblaTracking();
    }

    startQiblaTracking() {
        if (this.isQiblaTracking) return;

        this.isQiblaTracking = true;
        console.log('🧭 Starting qibla tracking');

        // Get initial qibla direction
        this.updateQiblaDirection();

        // Set up periodic qibla updates for smooth compass movement
        const qiblaInterval = setInterval(() => {
            this.updateQiblaDirection();
        }, this.UPDATE_INTERVALS.QIBLA);

        this.updateIntervals.set('qibla', qiblaInterval);
    }

    async updateQiblaDirection() {
        if (!this.currentLocation) {
            console.log('No location available for qibla direction');
            return;
        }

        try {
            const response = await qiblaApi.getQiblaDirection(
                this.currentLocation.coords.latitude,
                this.currentLocation.coords.longitude
            );

            if (response && response.data) {
                const previousQibla = this.qiblaDirection;
                this.qiblaDirection = response;

                // Notify listeners
                this.notifyListeners('qibla', {
                    qiblaDirection: this.qiblaDirection,
                    previousQibla,
                    timestamp: Date.now(),
                });

                console.log('✅ Qibla direction updated');
            }
        } catch (error) {
            console.error('Error updating qibla direction:', error);
            this.notifyListeners('qiblaError', { error: error.message });
        }
    }

    // ==================== VOICE RECOGNITION ====================
    
    async startVoiceRecognition(language = 'en-US') {
        try {
            const hasPermission = await voiceRecognitionService.requestPermissions();
            if (!hasPermission) {
                throw new Error('Microphone permission denied');
            }

            const success = await voiceRecognitionService.startListening(language);
            if (success) {
                // Set up real-time voice processing
                this.setupVoiceProcessing();
                console.log('🎤 Voice recognition started');
            }
            return success;
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            return false;
        }
    }

    setupVoiceProcessing() {
        voiceRecognitionService.setOnResult((result) => {
            this.notifyListeners('voiceResult', {
                transcript: result.transcript,
                confidence: result.confidence,
                isFinal: result.isFinal,
                timestamp: Date.now(),
            });

            // Process Quran text matching in real-time
            if (result.isFinal) {
                this.processQuranVoiceInput(result.transcript);
            }
        });

        voiceRecognitionService.setOnError((error) => {
            this.notifyListeners('voiceError', { error, timestamp: Date.now() });
        });

        voiceRecognitionService.setOnEnd(() => {
            this.notifyListeners('voiceEnd', { timestamp: Date.now() });
        });
    }

    async processQuranVoiceInput(transcript) {
        try {
            // Use the Quran API to search for matching text
            const searchResults = await quranApiService.searchQuran(transcript);
            
            if (searchResults && searchResults.length > 0) {
                this.notifyListeners('quranMatch', {
                    transcript,
                    matches: searchResults,
                    timestamp: Date.now(),
                });
            }
        } catch (error) {
            console.error('Error processing Quran voice input:', error);
        }
    }

    async stopVoiceRecognition() {
        try {
            await voiceRecognitionService.stopListening();
            console.log('🎤 Voice recognition stopped');
        } catch (error) {
            console.error('Error stopping voice recognition:', error);
        }
    }

    // ==================== LISTENER MANAGEMENT ====================
    
    addListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    removeListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for ${event}:`, error);
                }
            });
        }
    }

    // ==================== DATA GETTERS ====================
    
    getCurrentLocation() {
        return this.currentLocation;
    }

    getPrayerTimes() {
        return this.prayerTimes;
    }

    getQiblaDirection() {
        return this.qiblaDirection;
    }

    getNextPrayer() {
        return prayerTimeApi.getNextPrayer(this.prayerTimes);
    }

    getTimeUntilNextPrayer() {
        return prayerTimeApi.getTimeUntilNextPrayer(this.prayerTimes);
    }

    // ==================== MANUAL REFRESH ====================
    
    async refreshAllData() {
        console.log('🔄 Refreshing all real-time data');
        
        const promises = [
            this.updateCurrentLocation(),
            this.updatePrayerTimes(),
            this.updateQiblaDirection(),
        ];

        try {
            await Promise.all(promises);
            console.log('✅ All data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }

    // ==================== CLEANUP ====================
    
    stopAllTracking() {
        console.log('🛑 Stopping all real-time tracking');
        
        // Clear all intervals
        this.updateIntervals.forEach((interval, key) => {
            clearInterval(interval);
            console.log(`Stopped ${key} tracking`);
        });
        this.updateIntervals.clear();

        // Stop voice recognition
        this.stopVoiceRecognition();

        // Reset flags
        this.isLocationTracking = false;
        this.isPrayerTimeTracking = false;
        this.isQiblaTracking = false;

        // Clear listeners
        this.listeners.clear();
    }

    // ==================== STATUS AND DEBUGGING ====================
    
    getServiceStatus() {
        return {
            locationTracking: this.isLocationTracking,
            prayerTimeTracking: this.isPrayerTimeTracking,
            qiblaTracking: this.isQiblaTracking,
            hasLocation: !!this.currentLocation,
            hasPrayerTimes: this.prayerTimes.length > 0,
            hasQiblaDirection: !!this.qiblaDirection,
            voiceRecognitionAvailable: voiceRecognitionService.isAvailable(),
            voiceRecognitionActive: voiceRecognitionService.getIsListening(),
            activeIntervals: Array.from(this.updateIntervals.keys()),
            listenerCounts: Object.fromEntries(
                Array.from(this.listeners.entries()).map(([event, listeners]) => [event, listeners.size])
            ),
        };
    }

    // ==================== CONFIGURATION ====================
    
    updateInterval(event, newInterval) {
        if (this.UPDATE_INTERVALS.hasOwnProperty(event)) {
            this.UPDATE_INTERVALS[event] = newInterval;
            
            // Restart the interval if it's currently running
            if (this.updateIntervals.has(event)) {
                clearInterval(this.updateIntervals.get(event));
                this.updateIntervals.delete(event);
                
                // Restart the appropriate tracking
                switch (event) {
                    case 'PRAYER_TIMES':
                        this.startPrayerTimeTracking();
                        break;
                    case 'QIBLA':
                        this.startQiblaTracking();
                        break;
                    case 'LOCATION':
                        this.startLocationTracking();
                        break;
                }
            }
        }
    }
}

// Create singleton instance
const realTimeDataService = new RealTimeDataService();

// Export the service
export default realTimeDataService;
export { RealTimeDataService };

