import type { ExpoConfig } from 'expo/config';

const BUNDLE_IDENTIFIER = 'com.mariusdotdev.allinphuket';
const VERSION = '1.0.0';
// const BUILD_NUMBER = '16';
const BACKGROUND_COLOR = '#181410';

export default (): ExpoConfig => {
  return {
    name: 'AllInPhuket',
    slug: 'allinphuket',
    scheme: 'allinphuket',
    version: VERSION,
    orientation: 'portrait',
    icon: './assets/icon.png',

    userInterfaceStyle: 'dark',

    experiments: {
      typedRoutes: true,
    },

    backgroundColor: BACKGROUND_COLOR,
    // primaryColor: 'green',

    splash: {
      // image: './assets/splash.png',
      // resizeMode: 'cover',
      backgroundColor: BACKGROUND_COLOR,
    },

    assetBundlePatterns: ['**/*'],
    platforms: ['ios', 'android'],

    ios: {
      bundleIdentifier: BUNDLE_IDENTIFIER,
      runtimeVersion: VERSION,
      // buildNumber: BUILD_NUMBER,
      supportsTablet: false,
      infoPlist: {
        CADisableMinimumFrameDurationOnPhone: true,
      },
      config: {
        usesNonExemptEncryption: false,
      },
    },

    android: {
      package: BUNDLE_IDENTIFIER,
      runtimeVersion: { policy: 'appVersion' },
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },

    plugins: [
      'expo-router',
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '17.0',
          },
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: '34.0.0',
          },
        },
      ],
    ],

    extra: {
      eas: {
        projectId: '3884e6f7-9f0b-4d66-880d-47de7ff3a0f8',
      },
    },

    updates: {
      url: 'https://u.expo.dev/3884e6f7-9f0b-4d66-880d-47de7ff3a0f8',
    },
  };
};
