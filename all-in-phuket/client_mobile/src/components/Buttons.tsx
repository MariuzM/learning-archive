import { router } from 'expo-router';
import { TouchableWithoutFeedback, View } from 'react-native';

import { Color, cssGlobal, Style } from '../styles/base.style';

import { ChevronLeftIcon } from './Icons';

export const BackNavButton = () => {
  return (
    <TouchableWithoutFeedback onPress={() => router.back()}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: Color.Accent,
          borderRadius: Style.RadiusLg3,
          height: 50,
          justifyContent: 'center',
          paddingRight: 3,
          width: 50,
          // position: 'absolute',
          bottom: 25,
          left: 20,
          zIndex: 1,
          ...cssGlobal.ShadowBoxV2,
        }}
      >
        <ChevronLeftIcon color={Color.Bg} size={30} />
      </View>
    </TouchableWithoutFeedback>
  );
};
