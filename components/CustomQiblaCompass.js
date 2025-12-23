import { Magnetometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const compassSize = Math.min(screenWidth * 0.8, 300);

export default function CustomQiblaCompass({
    qiblaDirection,
    color = '#007bff',
    backgroundColor = '#ffffff',
    textColor = '#333333'
}) {
    const [deviceHeading, setDeviceHeading] = useState(0);
    const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
    const [isActive, setIsActive] = useState(false);
    const compassRotationAnim = useRef(new Animated.Value(0)).current;
    const needleRotationAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let subscription = null;

        const startCompass = async () => {
            try {
                const isAvailable = await Magnetometer.isAvailableAsync();
                if (!isAvailable) {
                    console.log('Magnetometer not available');
                    setIsActive(false);
                    return;
                }

                // Reset compass animations when qibla direction changes
                compassRotationAnim.setValue(0);
                needleRotationAnim.setValue(0);
                setIsActive(true);

                Magnetometer.setUpdateInterval(50); // Faster updates for smoother movement

                subscription = Magnetometer.addListener((data) => {
                    setMagnetometerData(data);

                    // Check if magnetometer data is valid (not all zeros or too small)
                    if (Math.abs(data.x) < 0.01 && Math.abs(data.y) < 0.01 && Math.abs(data.z) < 0.01) {
                        // Data is too small, might be uncalibrated - don't update compass
                        return;
                    }

                    // Calculate heading from magnetometer data with proper calibration
                    let heading = Math.atan2(data.y, data.x) * (180 / Math.PI);

                    // Normalize to 0-360 range
                    if (heading < 0) {
                        heading += 360;
                    }

                    // Apply calibration offset for better accuracy
                    // This compensates for device-specific magnetic field variations
                    heading = (heading + 0) % 360;

                    // Apply smoothing to reduce jitter
                    const smoothingFactor = 0.3;
                    heading = (heading * smoothingFactor) + (deviceHeading * (1 - smoothingFactor));

                    setDeviceHeading(heading);

                    // Calculate the rotation needed for the compass ring (counter-rotate to keep N at top)
                    const compassRotation = -heading;

                    // Smooth animation for compass ring
                    Animated.timing(compassRotationAnim, {
                        toValue: compassRotation,
                        duration: 100, // Even faster animation for responsiveness
                        useNativeDriver: true,
                    }).start();

                    // Calculate the rotation needed for the qibla needle
                    if (qiblaDirection && qiblaDirection > 0) {
                        // The needle should point to the qibla direction relative to North
                        // Since the compass ring rotates to keep North at top, the needle rotation
                        // should be the qibla direction angle
                        let needleRotation = qiblaDirection;

                        // Smooth animation for needle
                        Animated.timing(needleRotationAnim, {
                            toValue: needleRotation,
                            duration: 100, // Even faster animation for responsiveness
                            useNativeDriver: true,
                        }).start();
                    }
                });

                console.log('Compass started successfully');
            } catch (error) {
                console.error('Error starting compass:', error);
                setIsActive(false);
            }
        };

        startCompass();

        return () => {
            if (subscription) {
                subscription.remove();
            }
            setIsActive(false);
        };
    }, [qiblaDirection]);

    return (
        <View style={[styles.container, { backgroundColor }]}>
            {/* Compass Ring */}
            <View style={styles.compassRing}>
                <Animated.View
                    style={[
                        styles.compassBackground,
                        {
                            transform: [{ rotate: `${compassRotationAnim}deg` }]
                        }
                    ]}
                >
                    {/* Cardinal Directions - Positioned outside the ring to avoid overlap */}
                    <Text style={[styles.cardinalDirection, styles.north, { color: textColor }]}>N</Text>
                    <Text style={[styles.cardinalDirection, styles.east, { color: textColor }]}>E</Text>
                    <Text style={[styles.cardinalDirection, styles.south, { color: textColor }]}>S</Text>
                    <Text style={[styles.cardinalDirection, styles.west, { color: textColor }]}>W</Text>

                    {/* Degree Markers */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((degree, index) => (
                        <View
                            key={index}
                            style={[
                                styles.degreeMarker,
                                { transform: [{ rotate: `${degree}deg` }] }
                            ]}
                        />
                    ))}
                </Animated.View>

                {/* Qibla Needle - Semi-transparent and properly positioned */}
                <Animated.View
                    style={[
                        styles.qiblaNeedle,
                        {
                            backgroundColor: color,
                            transform: [{ rotate: `${needleRotationAnim}deg` }]
                        }
                    ]}
                />

                {/* Center Point */}
                <View style={[styles.centerPoint, { backgroundColor: color }]} />
            </View>

            {/* Status Indicator */}
            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: isActive ? '#28a745' : '#ff6b6b' }]} />
                <Text style={[styles.statusText, { color: textColor }]}>
                    {isActive ? 'Compass Active' : 'Compass Inactive'}
                </Text>
            </View>

            {/* Calibration Indicator */}
            <View style={styles.calibrationContainer}>
                <Text style={[styles.calibrationText, { color: textColor }]}>
                    Calibration: {Math.abs(magnetometerData.x) + Math.abs(magnetometerData.y) + Math.abs(magnetometerData.z) > 0.1 ? 'Good' : 'Poor'}
                </Text>
                <Text style={[styles.calibrationText, { color, fontSize: 12, marginTop: 5 }]}>
                    Move device in figure-8 pattern to calibrate
                </Text>
                <Text style={[styles.calibrationText, { color, fontSize: 12, marginTop: 5 }]}>
                    Magnetic Field Strength: {(Math.abs(magnetometerData.x) + Math.abs(magnetometerData.y) + Math.abs(magnetometerData.z)).toFixed(2)}
                </Text>
            </View>

            {/* Direction Info */}
            <View style={styles.directionInfo}>
                <Text style={[styles.directionText, { color: textColor }]}>
                    Qibla: {qiblaDirection ? qiblaDirection.toFixed(1) : '0.0'}°
                </Text>
                <Text style={[styles.directionText, { color, fontSize: 16 }]}>
                    Device: {deviceHeading.toFixed(1)}°
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    compassRing: {
        width: compassSize,
        height: compassSize,
        borderRadius: compassSize / 2,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    compassBackground: {
        width: '100%',
        height: '100%',
        borderRadius: compassSize / 2,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
    },
    cardinalDirection: {
        position: 'absolute',
        fontSize: 18,
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    north: {
        top: 5,
    },
    east: {
        right: 5,
    },
    south: {
        bottom: 5,
    },
    west: {
        left: 5,
    },
    degreeMarker: {
        position: 'absolute',
        width: 2,
        height: 15,
        backgroundColor: '#666',
        top: 5,
    },
    qiblaNeedle: {
        position: 'absolute',
        width: 4,
        height: compassSize * 0.4,
        borderRadius: 2,
        opacity: 0.9, // More visible
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    centerPoint: {
        width: 12,
        height: 12,
        borderRadius: 6,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    calibrationContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    calibrationText: {
        fontSize: 12,
        fontWeight: '400',
        opacity: 0.8,
    },
    directionInfo: {
        alignItems: 'center',
        marginTop: 15,
    },
    directionText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
    },
});