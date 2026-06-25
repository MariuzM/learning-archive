import { useCallback, useMemo, useRef } from 'react'
import { Button, StyleSheet, Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'

export const BottomSheetView = () => {
	const ref = useRef<BottomSheet>(null)
	const snapPoints = useMemo(() => ['25%', '50%'], [])

	const handleSheetChanges = useCallback((index: number) => {
		console.log('handleSheetChanges', index)
	}, [])

	return (
		<GestureHandlerRootView style={css.container}>
			<Button title="Open" onPress={() => ref.current?.snapToIndex(1)} />

			<BottomSheet
				ref={ref}
				index={1}
				snapPoints={snapPoints}
				onChange={handleSheetChanges}
				backdropComponent={(props) => {
					return <BottomSheetBackdrop {...props} onPress={() => ref.current?.close()} />
				}}
			>
				<BottomSheetScrollView style={css.sheetContainer}>
					<Text>Awesome2 2🎉</Text>
				</BottomSheetScrollView>
			</BottomSheet>
		</GestureHandlerRootView>
	)
}

const css = StyleSheet.create({
	container: {
		flex: 1,
		height: '100%',
		justifyContent: 'center',
	},
	sheetContainer: {
		flex: 1,
	},
	input: {
		backgroundColor: 'rgba(151, 151, 151, 0.25)',
		borderRadius: 10,
		padding: 12,
		width: '80%',
	},
})
