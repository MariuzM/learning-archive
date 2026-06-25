import { useEffect } from 'react';
import { View } from 'react-native';

import { Text } from '../components/BaseComponents';

export default function HomePage() {
  // let int = 0;
  // setInterval(() => {
  //   console.log('🚀 ~ int:', int);
  //   int++;
  // }, 1000);

  // useEffect(() => {
  //   console.log('mounted');
  //   return () => {
  //     console.log('unmounted');
  //   };
  // }, []);

  return (
    <View>
      <Text>Home</Text>
    </View>
  );
}
