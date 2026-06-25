import { View } from 'react-native';

import { BACKGROUND_COLOR } from '../styles/base.style';

import { Loader } from './Loaders';

export const SplashScreen = () => {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: BACKGROUND_COLOR,
        flex: 1,
        gap: 20,
        justifyContent: 'center',
      }}
    >
      <Loader />
    </View>
  );
};
