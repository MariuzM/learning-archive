import { Stack } from 'expo-router';

import { Header, HeaderSmall } from '../../components/Headers';

export default function CategoriesLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: 'transparent' },
        header(p) {
          if (p.route.name === 'index') return <HeaderSmall />;
          const routeName = (p.route.params as any).service;
          return <Header title={routeName} />;
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[services]" />
      <Stack.Screen name="serviceTopTab" />
      <Stack.Screen name="service__estate-item" options={{ headerShown: false }} />
    </Stack>
  );
}
