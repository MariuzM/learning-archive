import type { ExpoConfig } from 'expo/config'

const BUNDLE_IDENTIFIER = 'com.mariuzm.expostarterapp'
const VERSION = '1.0.0'
const BUILD_NUMBER = '1'
const BACKGROUND_COLOR = '#fb00ff'
const TEST_COLOR = '#00ff08'
const TEST_COLOR_2 = '#00f7ff'

export default (): ExpoConfig => {
	return {
		name: 'Expo Starter App',
		slug: 'expo-starter-app',
		scheme: 'expo-starter-app',
		version: VERSION,
		orientation: 'portrait',
		icon: './assets/icon.png',

		userInterfaceStyle: 'light',

		splash: { backgroundColor: BACKGROUND_COLOR },
		backgroundColor: TEST_COLOR,
		primaryColor: TEST_COLOR_2,

		assetBundlePatterns: ['**/*'],
		platforms: ['ios', 'android'],

		ios: {
			bundleIdentifier: BUNDLE_IDENTIFIER,
			runtimeVersion: VERSION,
			buildNumber: BUILD_NUMBER,
			supportsTablet: true,
			infoPlist: {},
		},

		android: {
			package: BUNDLE_IDENTIFIER,
			adaptiveIcon: {
				foregroundImage: './assets/adaptive-icon.png',
				backgroundColor: '#ffffff',
			},
		},

		web: {
			favicon: './assets/favicon.png',
		},

		plugins: [
			'expo-router',
			[
				'expo-build-properties',
				{
					ios: {
						// newArchEnabled: true,
						deploymentTarget: '15.0',
					},
					android: {
						// newArchEnabled: true,
						compileSdkVersion: 34,
						targetSdkVersion: 34,
						buildToolsVersion: '34.0.0',
					},
				},
			],
		],

		experiments: {
			typedRoutes: true,
		},

		extra: {
			eas: {},
		},
	}
}
