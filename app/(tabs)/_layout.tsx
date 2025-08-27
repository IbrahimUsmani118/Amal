import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const [currentPage, setCurrentPage] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const pageWidth = screenWidth;

  const tabItems = [
    { name: 'Quran', icon: 'book', route: 'quran', color: '#ffd700' },
    { name: 'Prayer Times', icon: 'time', route: 'prayer-times', color: '#28a745' },
    { name: 'Qibla', icon: 'compass', route: 'qibla', color: '#007bff' },
    { name: 'Settings', icon: 'settings', route: 'settings', color: '#ff6b6b' },
  ];

  // Mark component as mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Sync current page with current route
  useEffect(() => {
    if (!isMounted) return;
    
    const currentRoute = segments[segments.length - 1];
    const pageIndex = tabItems.findIndex(item => item.route === currentRoute);
    if (pageIndex !== -1 && pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
    }
  }, [segments, isMounted, currentPage]);

  const handlePageChange = (pageIndex: number) => {
    if (!isMounted) return;
    
    setCurrentPage(pageIndex);
    
    // Navigate to the selected tab using the correct path
    const route = tabItems[pageIndex].route;
    router.push(`/(tabs)/${route}` as any);
    
    // Animate to the selected page
    Animated.spring(scrollX, {
      toValue: pageIndex * pageWidth,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getThemeColors = () => {
    if (theme === 'light') {
      return {
        background: '#f8f6f0',
        surface: '#ffffff',
        text: '#3d3d3d',
        textSecondary: '#666666',
        border: '#e0e0e0',
        active: '#007bff',
      };
    }
    return {
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#404040',
      active: '#ffd700',
    };
  };

  const colors = getThemeColors();

  if (!isMounted) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'} 
        backgroundColor={colors.background}
      />
      
      {/* Custom Navigation Bar */}
      <View style={[styles.navigationContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.sliderContainer}>
          {tabItems.map((item, index) => (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.tabItem,
                { width: pageWidth / tabItems.length }
              ]}
              onPress={() => handlePageChange(index)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={currentPage === index ? item.color : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: currentPage === index ? item.color : colors.textSecondary,
                      fontWeight: currentPage === index ? '600' : '400',
                    }
                  ]}
                >
                  {item.name}
                </Text>
              </View>
              
              {/* Active Indicator */}
              {currentPage === index && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: item.color }
                  ]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContentContainer}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // Hide the traditional tab bar
          }}
        >
          <Tabs.Screen
            name="quran"
            options={{
              title: 'Quran',
            }}
          />
          <Tabs.Screen
            name="prayer-times"
            options={{
              title: 'Prayer Times',
            }}
          />
          <Tabs.Screen
            name="qibla"
            options={{
              title: 'Qibla',
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigationContainer: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 10,
    marginTop: 50, // Back to previous position
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
  },
  tabContentContainer: {
    flex: 1,
  },
});
