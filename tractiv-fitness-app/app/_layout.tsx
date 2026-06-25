import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { SplashScreen } from '../src/components/SplashScreen';
import { useStoreUserActivities } from '../src/states/stateUserActivity.state';
import { BACKGROUND_COLOR } from '../src/styles/global.style';

export default function AppLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    'Europa-Bold': require('../assets/fonts/Europa-Bold.ttf'),
    'Europa-Light': require('../assets/fonts/Europa-Light.ttf'),
    'RiftSoft-Demi': require('../assets/fonts/RiftSoft-Demi.otf'),
    'RiftSoft-Medium': require('../assets/fonts/RiftSoft-Medium.otf'),
  });

  useEffect(() => {
    (async () => {
      try {
        useStoreUserActivities.getState().initTimeSlots();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    })();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (!appIsReady) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: BACKGROUND_COLOR } }}>
      <Stack.Screen name="index" options={{ title: 'Bottom Sheet', header: () => null }} />
    </Stack>
  );
}
