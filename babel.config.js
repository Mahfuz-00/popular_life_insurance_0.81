module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Worklets plugin FIRST
    // require.resolve('react-native-worklets-core/babel'),

    // Reanimated plugin MUST BE LAST (this is the official rule for v4)
    'react-native-worklets/plugin',
  ],
};