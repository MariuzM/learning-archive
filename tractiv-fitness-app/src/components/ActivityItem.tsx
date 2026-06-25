import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Color, cssGlobal, Shadows, Style } from '../styles/global.style';
import type { Activity } from '../types/activity.type';

export const ActivityBox = ({ icon, image, name, subtitle }: Activity) => {
  return (
    <View style={css.container}>
      <View style={css.content}>
        <Image contentFit="cover" source={{ uri: image }} transition={100} style={css.image} />

        <View style={css.icon}>
          <View style={{ transform: [{ scale: 0.8 }] }}>{icon({ isPressed: false })}</View>
        </View>

        <View style={css.textContainer}>
          <Text style={cssGlobal.text_h3}>{name}</Text>
          <Text style={cssGlobal.text_h4}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
};

const css = StyleSheet.create({
  container: {
    backgroundColor: Color.Snow,
    height: 182,
    marginHorizontal: 10,
    borderRadius: Style.RadiusLg,
    width: 136,
    ...Shadows.ShadowMd,
  },
  content: {
    alignItems: 'center',
    borderRadius: Style.RadiusLg,
    height: '100%',
    overflow: 'hidden',
  },
  image: {
    height: 100,
    width: '100%',
  },
  icon: {
    alignItems: 'center',
    backgroundColor: Color.Snow,
    borderRadius: 50,
    height: 45,
    justifyContent: 'center',
    position: 'absolute',
    top: '42.5%',
    width: 45,
    ...Shadows.ShadowMd,
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    paddingTop: 10,
  },
});
