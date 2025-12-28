module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        // Removed 'react-native-reanimated/plugin' - no longer using reanimated
    };
};
