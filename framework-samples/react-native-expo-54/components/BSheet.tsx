import { useCallback, useRef } from 'react'
import { Button, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'

const SNAP_POINTS = ['20%', '50%', '90%']

export const BSheet = () => {
  const ref = useRef<BottomSheet>(null)

  const onChange = useCallback((i: number) => {
    console.log('handleSheetChanges', i)
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1, width: '100%' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button title="Open" onPress={() => ref.current?.snapToIndex(1)} />
      </View>

      <BottomSheet
        ref={ref}
        onChange={onChange}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        index={-1}
      >
        <BottomSheetScrollView>
          <View style={{ flex: 1, backgroundColor: 'red' }}>
            <Text>Awesome 🎉</Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  )
}
