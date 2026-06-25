import { Text, View } from 'react-native'

import { BSheet } from '@/components/BSheet'

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home</Text>
      <BSheet />
    </View>
  )
}
