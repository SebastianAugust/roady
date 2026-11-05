// Learn more: https://docs.expo.dev/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-maps has no web build. The web bundle (phone-frame preview in the web dashboard) gets a small tile map instead;
// Android and iOS keep resolving the real package.
const mapsWeb = path.resolve(__dirname, 'src/web/ReactNativeMapsWeb.tsx');
const defaultResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') return { type: 'sourceFile', filePath: mapsWeb };
  return (defaultResolve ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
