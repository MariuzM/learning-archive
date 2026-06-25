import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'

export default function HomePage() {
	const router = useRouter()

	function onPress(item: string) {
		router.push('/users/')
		router.setParams({ userId: item })
	}

	return (
		<View
			style={{
				alignItems: 'center',
				flex: 1,
				justifyContent: 'center',
			}}
		>
			<TouchableOpacity onPress={() => onPress('user1')}>
				<Text>User 1</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={() => onPress('user2')}>
				<Text>User 2</Text>
			</TouchableOpacity>
		</View>
	)
}
