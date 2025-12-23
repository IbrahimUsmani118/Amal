import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function CustomSlider({
    items,
    onItemChange,
    initialIndex = 0,
    type = 'tabs',
    theme = 'dark',
    height = 60,
}) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const translateX = useRef(new Animated.Value(0)).current;
    const [sliderWidth, setSliderWidth] = useState(0);
    const itemWidth = sliderWidth / items.length;

    useEffect(() => {
        if (sliderWidth > 0) {
            const targetX = currentIndex * itemWidth;
            Animated.spring(translateX, {
                toValue: targetX,
                useNativeDriver: true,
                tension: 300,
                friction: 30,
            }).start();
        }
    }, [currentIndex, itemWidth, sliderWidth]);

    const handleItemPress = (index) => {
        setCurrentIndex(index);
        onItemChange(index, items[index]);
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            onItemChange(newIndex, items[newIndex]);
        }
    };

    const goToNext = () => {
        if (currentIndex < items.length - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            onItemChange(newIndex, items[newIndex]);
        }
    };

    const getThemeColors = () => {
        if (theme === 'light') {
            return {
                background: 'rgba(60, 60, 60, 0.15)',
                activeBackground: '#5a5a5a',
                text: '#3d3d3d',
                activeText: '#f8f6f0',
                border: 'rgba(60, 60, 60, 0.3)',
                indicator: '#5a5a5a',
                inactiveText: '#555555', // Much better contrast for inactive text
            };
        }
        return {
            background: 'rgba(255, 255, 255, 0.15)',
            activeBackground: '#ffd700',
            text: '#e8e8e8',
            activeText: '#1a1a2e',
            border: 'rgba(255, 255, 255, 0.3)',
            indicator: '#ffd700',
            inactiveText: '#b0b0b0', // Much better contrast for inactive text
        };
    };

    const colors = getThemeColors();

    return (
        <View style={[styles.container, { height }]}>
            {/* Left Navigation Arrow */}
            {currentIndex > 0 && (
                <TouchableOpacity
                    style={[styles.navArrow, styles.leftArrow]}
                    onPress={goToPrevious}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityLabel="Go to previous item"
                    accessibilityRole="button"
                >
                    <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
            )}

            {/* Right Navigation Arrow */}
            {currentIndex < items.length - 1 && (
                <TouchableOpacity
                    style={[styles.navArrow, styles.rightArrow]}
                    onPress={goToNext}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityLabel="Go to next item"
                    accessibilityRole="button"
                >
                    <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </TouchableOpacity>
            )}

            <View
                style={[
                    styles.sliderContainer,
                    {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        height,
                    },
                ]}
                onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
            >
                {/* Active Indicator */}
                <Animated.View
                    style={[
                        styles.activeIndicator,
                        {
                            backgroundColor: colors.activeBackground,
                            width: itemWidth,
                            transform: [{ translateX }],
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        },
                    ]}
                />

                {/* Items */}
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.item,
                            { width: itemWidth }
                        ]}
                        onPress={() => handleItemPress(index)}
                        activeOpacity={0.7}
                        accessible={true}
                        accessibilityLabel={`${item.title}${item.subtitle ? `, ${item.subtitle}` : ''}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: index === currentIndex }}
                    >
                        <View style={styles.itemContent}>
                            {item.icon && (
                                <Ionicons
                                    name={item.icon}
                                    size={type === 'tabs' ? 20 : 24}
                                    color={index === currentIndex ? colors.activeText : colors.inactiveText}
                                    style={styles.itemIcon}
                                />
                            )}
                            <View style={styles.itemTextContainer}>
                                <Text
                                    style={[
                                        styles.itemTitle,
                                        {
                                            color: index === currentIndex ? colors.activeText : colors.inactiveText,
                                            fontSize: type === 'tabs' ? 14 : 16,
                                        }
                                    ]}
                                >
                                    {item.title}
                                </Text>
                                {item.subtitle && (
                                    <Text
                                        style={[
                                            styles.itemSubtitle,
                                            {
                                                color: index === currentIndex ? colors.activeText : colors.inactiveText,
                                                fontSize: type === 'tabs' ? 10 : 12,
                                            }
                                        ]}
                                    >
                                        {item.subtitle}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Position Indicator */}
            <View style={styles.positionIndicator}>
                <Text style={[styles.positionText, { color: colors.text }]}>
                    {currentIndex + 1} of {items.length}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    sliderContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    activeIndicator: {
        position: 'absolute',
        height: '100%',
        borderRadius: 8,
        zIndex: 1,
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    itemContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 8,
    },
    itemIcon: {
        marginRight: 4,
    },
    itemTextContainer: {
        alignItems: 'center',
    },
    itemTitle: {
        fontWeight: '600',
        textAlign: 'center',
    },
    itemSubtitle: {
        fontWeight: '400',
        textAlign: 'center',
        marginTop: 2,
    },
    navArrow: {
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -10 }],
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    leftArrow: {
        left: 8,
    },
    rightArrow: {
        right: 8,
    },
    positionIndicator: {
        position: 'absolute',
        bottom: -25,
        left: '50%',
        transform: [{ translateX: -50 }],
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        zIndex: 10,
    },
    positionText: {
        fontSize: 12,
        fontWeight: '500',
    },
});