import LottieView from 'lottie-react-native';
import { useRef } from 'react';

export const Loader = ({ width = 100 }: { width?: number }) => {
  const animation = useRef<LottieView>(null);

  return (
    <LottieView
      ref={animation}
      autoPlay
      loop
      resizeMode="cover"
      style={{ height: width, width: width }}
      source={require('../../assets/lottie/loader.json')}
    />
  );
};
