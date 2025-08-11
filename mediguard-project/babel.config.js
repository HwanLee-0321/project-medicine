// babel.config.js (프로젝트 루트)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        alias: {
          '@': './',
          '@app': './app',
          '@features': './features',
          '@components': './components',
          '@styles': './styles',
          '@services': './services',
          '@lib': './lib',
          '@assets': './assets',
        },
      }],
      'react-native-reanimated/plugin',
    ],
  };
};
