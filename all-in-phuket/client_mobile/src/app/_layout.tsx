import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { BgGradiant } from '../components/Gradiants';
import { HeaderSmall } from '../components/Headers';
import { SplashScreen } from '../components/SplashScreen';
import { ROOT_ROUTES, Tab } from '../components/Tab';
import { useStateInit } from '../states/init.state';
import { Color } from '../styles/base.style';

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await useStateInit.getState().initData();
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    })();
  }, []);

  if (!appIsReady) {
    return <SplashScreen />;
  }

  return (
    <>
      <StatusBar style="light" />
      <BgGradiant>
        <Tabs
          screenOptions={{
            header: () => <HeaderSmall />,
          }}
          sceneContainerStyle={{
            backgroundColor: 'transparent',
            // paddingTop: STATUS_BAR_HEIGHT,
            // paddingHorizontal: CONTENT_PADDING_X,
          }}
          tabBar={(p) => <Tab {...p} />}
        >
          {ROOT_ROUTES.map((item, idx) => {
            return (
              <Tabs.Screen
                key={idx}
                name={item.routeName}
                options={{
                  title: item.name,
                  headerTitleStyle: { color: Color.Text },
                  ...(item.routeName === 'services' && { headerShown: false }),
                }}
              />
            );
          })}
        </Tabs>
      </BgGradiant>
    </>
  );
}
