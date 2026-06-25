import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { textFormat } from '../__SHARED__/utils/text.util';
import { Color, TAB_HIDE_CONTENT_HEIGHT } from '../styles/base.style';
import type { TabItemT, TransformedInit } from '../utils/formatForTabs.util';

import { Text } from './BaseComponents';
import { ListingBox } from './Boxes';

const { width } = Dimensions.get('screen');

export const TabSlider = ({ items }: { items: TransformedInit }) => {
  const scrollX = useRef<Animated.Value>(new Animated.Value(0)).current;
  const ref = useRef<Animated.FlatList | null>(null);
  const onItemPress = useCallback((itemIdx: number) => {
    ref.current?.scrollToOffset({ offset: itemIdx * width });
  }, []);

  return (
    <View style={css.container}>
      <Tabs scrollX={scrollX} items={items.tabs} onItemPress={onItemPress} />

      <Animated.FlatList
        ref={ref}
        data={items.tabs}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        renderItem={({ item }) => {
          return (
            <View style={{ width }}>
              <FlatList
                data={item.listings}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                style={{
                  marginBottom: TAB_HIDE_CONTENT_HEIGHT,
                }}
                contentContainerStyle={{
                  paddingBottom: TAB_HIDE_CONTENT_HEIGHT,
                  padding: 10,
                  gap: 12,
                }}
                renderItem={({ item }) => <ListingBox item={item} />}
              />
            </View>
          );
        }}
      />
    </View>
  );
};

const css = StyleSheet.create({
  container: {
    height: '100%',
  },
});

const Indicator = ({
  scrollX,
  measures,
  items,
}: {
  scrollX: Animated.Value;
  measures: TabMeasure[];
  items: TabItemT[];
}) => {
  const inputRange = items.map((_, i) => i * width);

  return (
    <Animated.View
      style={{
        backgroundColor: Color.Accent,
        borderRadius: 10,
        bottom: 8,
        flexDirection: 'row',
        height: 4,
        left: 0,
        position: 'absolute',
        ...(inputRange.length > 1 && {
          width: scrollX.interpolate({
            inputRange: inputRange,
            outputRange: measures.map((m) => m.width),
          }),
          transform: [
            {
              translateX: scrollX.interpolate({
                inputRange,
                outputRange: measures.map((m) => m.x),
              }),
            },
          ],
        }),
      }}
    />
  );
};

const TabItem = forwardRef(
  (
    {
      item,
      onItemPress,
    }: {
      item: TabItemT;
      onItemPress: () => void;
    },
    ref: React.ForwardedRef<View>
  ) => {
    return (
      <TouchableOpacity
        onPress={onItemPress}
        style={{ alignItems: 'center', flex: 1, height: '100%', justifyContent: 'center' }}
      >
        <View ref={ref}>
          <Text>{textFormat(item.title)}</Text>
        </View>
      </TouchableOpacity>
    );
  }
);

type TabMeasure = { x: number; y: number; width: number; height: number };

const Tabs = ({
  scrollX,
  items,
  onItemPress,
}: {
  scrollX: Animated.Value;
  items: TabItemT[];
  onItemPress: (itemIdx: number) => void;
}) => {
  const [measures, setMeasures] = useState<TabMeasure[]>([]);
  const tabsRef = useRef<View | null>(null);

  useEffect(() => {
    const m: TabMeasure[] = [];
    items.forEach((item) => {
      if (item.ref.current) {
        if (!tabsRef.current) return;
        item.ref.current.measureLayout(tabsRef.current, (x, y, width, height) => {
          m.push({ x, y, width, height });
          if (m.length === items.length) setMeasures(m);
        });
      }
    });
  }, [items]);

  return (
    <View
      ref={tabsRef}
      style={{
        alignItems: 'center',
        backgroundColor: Color.Bg,
        flexDirection: 'row',
        height: 55,
        justifyContent: 'space-evenly',
      }}
    >
      {items.map((item, i) => {
        return <TabItem key={i} ref={item.ref} item={item} onItemPress={() => onItemPress(i)} />;
      })}
      {measures.length > 0 && <Indicator scrollX={scrollX} measures={measures} items={items} />}
    </View>
  );
};
