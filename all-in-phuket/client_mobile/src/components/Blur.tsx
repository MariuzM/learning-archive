import { BlurView } from 'expo-blur';
import type { ViewStyle } from 'react-native';

export const BLUR_INTENSITY = 90;

export const Blur = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  return (
    <BlurView tint="systemMaterialDark" intensity={BLUR_INTENSITY} style={[style]}>
      {children}
    </BlurView>
  );
};
