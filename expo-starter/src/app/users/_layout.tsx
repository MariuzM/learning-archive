import { Stack } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'

export default function UsersLayout() {
	return (
		<Stack
			screenOptions={{
				header(p: any) {
					return (
						<View style={{ backgroundColor: 'lightblue', height: 100, justifyContent: 'flex-end' }}>
							<Text>TITLE: {p.route.params?.userId}</Text>

							<TouchableOpacity onPress={() => p.navigation.goBack()}>
								<Text style={{ fontSize: 30 }}> Back to {p.back?.title}</Text>
							</TouchableOpacity>
						</View>
					)
				},
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="[user]" />
		</Stack>
	)
}
