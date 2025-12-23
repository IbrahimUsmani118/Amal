module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Disable reanimated plugin auto-addition (we'll use worklets plugin directly)
          reanimated: false,
        },
      ],
    ],
    plugins: [
      // Module resolver for path aliases (@/ imports)
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': '.',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      // react-native-worklets plugin must be listed last (required for react-native-reanimated)
      // Using worklets plugin directly instead of reanimated plugin to avoid wrapper issues
      'react-native-worklets/plugin',
    ],
  };
};
