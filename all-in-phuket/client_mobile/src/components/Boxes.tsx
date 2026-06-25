import { router } from 'expo-router';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import type { RealEstate } from '../__SHARED__/types/listings.type';
import { Color, cssGlobal, Style } from '../styles/base.style';

import { Text, TextPrice } from './BaseComponents';
import { Blur } from './Blur';
import { Image } from './Image';

// ==================================================================

export const Box = ({ children }: { children: React.ReactNode }) => {
  return <View style={css.container}>{children}</View>;
};

const css = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Color.Bg,
    // borderColor: Color.Accent,
    // borderWidth: 1,
    borderRadius: Style.Radius,
    height: 240,
    justifyContent: 'center',
    width: 170,
    ...cssGlobal.ShadowBoxV2,
  },
});

// ==================================================================

export const ListingBox = ({ item }: { item: RealEstate }) => {
  function onPress() {
    router.push('/services/service__estate-item');
    router.setParams({ estateItemStack: JSON.stringify(item) });
  }

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: Color.Bg,
          borderRadius: Style.Radius,
          height: 400,
          justifyContent: 'center',
          width: '100%',
          overflow: 'hidden',
          ...cssGlobal.ShadowBoxV2,
        }}
      >
        <Image imgUrl={item.images && item.images[0]} />
        <View
          style={{
            alignItems: 'center',
            bottom: 0,
            justifyContent: 'center',
            padding: 16,
            position: 'absolute',
            width: '100%',
          }}
        >
          <Blur
            style={{
              borderRadius: Style.Radius,
              bottom: 0,
              justifyContent: 'center',
              marginBottom: 12,
              overflow: 'hidden',
              padding: 16,
              position: 'absolute',
              width: '100%',
            }}
          >
            <Text maxLines={2} style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
              {item.name}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>{item.location}</Text>
              <TextPrice price={item.price} />
            </View>
          </Blur>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
