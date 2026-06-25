import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  Color,
  cssShadow,
  Style,
  TAB_BAR_HEIGHT,
  TAB_BAR_POSITION_FROM_BOTTOM,
} from '../styles/base.style';
import { radiusInnerCalc } from '../styles/utils/radiusCalc.util';

import { TabActiveGradiant, TabBgGradiant } from './Gradiants';
import { EventIcon, PhoneIcon, SettingsIcon, SparklesIcon, SquareIcon } from './Icons';

export const ROOT_ROUTES = [
  { name: 'Discover', routeName: 'index', icon: SparklesIcon },
  { name: 'Bookings', routeName: 'bookings', icon: EventIcon },
  { name: 'Services', routeName: 'services', icon: SquareIcon },
  { name: 'Contact', routeName: 'contact', icon: PhoneIcon },
  { name: 'Settings', routeName: 'settings', icon: SettingsIcon },
];

export const Tab = ({ state, navigation }: BottomTabBarProps) => {
  return (
    <View style={[css.tabContainer, { position: 'absolute' }]}>
      <TabBgGradiant style={css.tabContent}>
        {state.routes.map((item, idx) => {
          const isFocused = state.index === idx;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: item.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(item.name, { merge: true });
            }
          };

          if (!ROOT_ROUTES[idx]) return null;

          return (
            <TouchableOpacity
              key={item.key}
              accessibilityRole="button"
              onPress={onPress}
              style={css.button}
            >
              <TabActiveGradiant isFocused={isFocused}>
                <View style={{ height: 32, width: '100%' }}>
                  {ROOT_ROUTES[idx].icon({ color: isFocused ? Color.Text : Color.TextDark })}
                </View>

                <Text
                  style={{
                    color: isFocused ? Color.Text : Color.TextDark,
                    fontSize: 10,
                    textAlign: 'center',
                    width: '100%',
                  }}
                >
                  {ROOT_ROUTES[idx].name}
                </Text>
              </TabActiveGradiant>
            </TouchableOpacity>
          );
        })}
      </TabBgGradiant>
    </View>
  );
};

const RADIUS = radiusInnerCalc(Style.RadiusLg3, 4);

const css = StyleSheet.create({
  tabContainer: {
    alignSelf: 'center',
    backgroundColor: Color.Bg,
    borderColor: Color.Accent,
    borderRadius: RADIUS,
    borderWidth: 1,
    bottom: TAB_BAR_POSITION_FROM_BOTTOM,
    height: TAB_BAR_HEIGHT,
    width: '98%',
    ...cssShadow.ShadowBox,
  },
  tabContent: {
    alignItems: 'center',
    borderRadius: RADIUS,
    flexDirection: 'row',
    margin: 4,
  },
  button: {
    flex: 1,
  },
});
