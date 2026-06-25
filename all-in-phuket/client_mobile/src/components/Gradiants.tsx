import { LinearGradient } from 'expo-linear-gradient';
import type { ViewStyle } from 'react-native';

import { Color, Style } from '../styles/base.style';
import { radiusInnerCalc } from '../styles/utils/radiusCalc.util';

export const BgGradiant = ({ children }: { children: React.ReactNode }) => {
  return (
    <LinearGradient colors={[Color.BgTop, Color.BgBottom]} style={{ flex: 1 }}>
      {children}
    </LinearGradient>
  );
};

export const TabBgGradiant = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => {
  return (
    <LinearGradient colors={[Color.BgTop, Color.BgBottom]} style={style}>
      {children}
    </LinearGradient>
  );
};

export const TabActiveGradiant = ({
  children,
  isFocused = false,
}: {
  children: React.ReactNode;
  isFocused?: boolean;
}) => {
  return (
    <LinearGradient
      colors={isFocused ? [Color.ActiveBgTop, Color.ActiveBgBottom] : ['transparent']}
      style={{
        alignItems: 'center',
        borderRadius: Style.Radius,
        height: '100%',
        justifyContent: 'center',
      }}
    >
      {children}
    </LinearGradient>
  );
};
