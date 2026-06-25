import { Text, View } from 'react-native';

import { cssGlobal } from '../styles/global.style';

import { Logo } from './Logos';

export const SplashScreen = () => {
  return (
    <View style={{ alignItems: 'center', flex: 1, gap: 20, justifyContent: 'center' }}>
      <View style={{ transform: [{ scale: 2 }] }}>
        <Logo />
      </View>
      <Text style={cssGlobal.text_h1}>Tractiv</Text>
    </View>
  );
};
