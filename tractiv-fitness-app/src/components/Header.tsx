import { StyleSheet, View } from 'react-native';

import { Color } from '../styles/global.style';

import { HeaderLogo } from './Logos';

export const Header = () => {
  return (
    <View style={css.container}>
      <HeaderLogo />
    </View>
  );
};

const css = StyleSheet.create({
  container: {
    alignItems: 'center',

    // backgroundColor: Color.Snow,
    backgroundColor: Color.Snow,
    flex: 1,
    justifyContent: 'center',
    maxHeight: 80,
    minHeight: 80,
    shadowColor: Color.ShadowV2,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 1,
    zIndex: 1,
  },
});
