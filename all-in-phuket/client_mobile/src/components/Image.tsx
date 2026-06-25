import { Image as RNImage } from 'expo-image';
import { useState } from 'react';
import type { DimensionValue } from 'react-native';
import { Text, View } from 'react-native';

import { Style } from '../styles/base.style';

export const Image = ({
  size = '100%',
  imgUrl,
}: {
  size?: DimensionValue;
  imgUrl?: string | undefined | null;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!imgUrl) return null;

  return (
    <View
      style={{
        alignItems: 'center',
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      <>
        {isLoading && imgUrl && (
          <View
            style={{
              alignItems: 'center',
              borderRadius: Style.Radius,
              borderWidth: 2,
              height: '100%',
              justifyContent: 'center',
              position: 'absolute',
              width: '100%',
              zIndex: 1,
            }}
          >
            <Text>Loading</Text>
          </View>
        )}

        <RNImage
          contentFit="cover"
          // onLoadEnd={() => setIsLoading(false)}
          // onLoadStart={() => setIsLoading(true)}
          // source={{ uri: process.env.EXPO_PUBLIC_IMAGES_URL + imgUrl }}
          source={{ uri: imgUrl }}
          transition={100}
          style={{
            // borderRadius: Style.Radius,
            height: '100%',
            width: '100%',
          }}
        />
      </>
    </View>
  );
};
