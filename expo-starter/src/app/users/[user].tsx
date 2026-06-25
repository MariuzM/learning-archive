import { useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'

export default function UserPage() {
	const slug = useLocalSearchParams()

	return (
		<View
			style={{
				alignItems: 'center',
				flex: 1,
				justifyContent: 'center',
			}}
		>
			<Text>{slug.userId}</Text>
		</View>
	)
}
