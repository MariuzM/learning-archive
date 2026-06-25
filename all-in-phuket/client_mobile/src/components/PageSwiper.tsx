import { Image } from 'expo-image';
import { useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { PageIndicator } from 'react-native-page-indicator';

export const PageSwiper = ({ items = [] }: { items: string[] }) => {
  const { width } = useWindowDimensions();
  const scrollX = useRef<Animated.Value>(new Animated.Value(0)).current;
  const animatedCurrent = useRef(Animated.divide(scrollX, width)).current;

  return (
    <>
      <Animated.ScrollView
        bounces={false}
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
      >
        {items.map((item, i) => (
          <View key={i} style={[css.page, { width }]}>
            <Image
              source={{ uri: item }}
              contentFit="cover"
              transition={100}
              style={{ height: '100%', width: '100%' }}
            />
          </View>
        ))}
      </Animated.ScrollView>

      <PageIndicator
        count={items.length}
        current={animatedCurrent}
        size={8}
        style={css.pageIndicator}
        color="white"
      />
    </>
  );
};

const css = StyleSheet.create({
  page: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  pageIndicator: {
    bottom: 30,
    left: 20,
    position: 'absolute',
    right: 20,
  },
});
