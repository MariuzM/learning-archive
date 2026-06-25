import { router } from 'expo-router'
import { Button, View } from 'react-native'

export default function Page1() {
	return (
		<View style={{ marginTop: 100 }}>
			<Button title="Back" onPress={() => router.back()} />
		</View>
	)
}
