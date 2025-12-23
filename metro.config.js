// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for voice recognition libraries
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure proper module resolution for voice libraries
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add support for .mjs files (some voice libraries use these)
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
